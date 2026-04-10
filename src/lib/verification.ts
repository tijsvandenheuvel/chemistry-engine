import { atomSeed } from "../data/atoms.seed";
import { periodicTable } from "../data/periodic-table";
import type {
  AtomRecord,
  MoleculeRecord,
  ReactionRecord,
  VerificationFieldRecord,
  VerificationObservation,
  VerificationReport,
  VerificationSourceRecord,
  VerificationStatus
} from "../types/chemistry";
import { getPubChemCompoundUrl, getPubChemPropertyUrl, getPubChemViewUrl } from "./pubchem";

type PubChemPropertyRecord = {
  IUPACName?: string;
  MolecularFormula?: string;
  MolecularWeight?: number;
  XLogP?: number;
  TPSA?: number;
  HBondDonorCount?: number;
  HBondAcceptorCount?: number;
  ExactMass?: number;
  Complexity?: number;
  Charge?: number;
};

type PubChemPropertyResponse = {
  PropertyTable?: {
    Properties?: PubChemPropertyRecord[];
  };
};

const moleculePropertyFields = [
  "IUPACName",
  "MolecularFormula",
  "MolecularWeight",
  "XLogP",
  "TPSA",
  "HBondDonorCount",
  "HBondAcceptorCount",
  "ExactMass",
  "Complexity",
  "Charge"
];
const formulaTokenPattern = /([A-Z][a-z]?)(\d*)/g;
const moleculeVerificationCache = new Map<string, Promise<VerificationReport>>();
const curatedAtomSeedByNumber = new Map(atomSeed.map((atom) => [atom.atomicNumber, atom]));
const periodicElementByNumber = new Map(periodicTable.map((element) => [element.atomicNumber, element]));

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatMaybeNumber(value: number | undefined, digits: number) {
  return typeof value === "number" ? value.toFixed(digits) : "n/a";
}

function createObservation(sourceId: string, sourceLabel: string, value: string): VerificationObservation {
  return {
    sourceId,
    sourceLabel,
    value
  };
}

function createField(
  id: string,
  label: string,
  status: VerificationStatus,
  canonicalValue: string,
  observations: VerificationObservation[],
  note?: string
): VerificationFieldRecord {
  return {
    id,
    label,
    status,
    canonicalValue,
    observations,
    note
  };
}

function tallyCounts(fields: VerificationFieldRecord[]) {
  return fields.reduce(
    (counts, field) => {
      if (field.status === "verified") {
        counts.verified += 1;
      } else if (field.status === "conflict") {
        counts.conflict += 1;
      } else if (field.status === "single-source") {
        counts.singleSource += 1;
      } else if (field.status === "pending") {
        counts.pending += 1;
      } else if (field.status === "modelled") {
        counts.modelled += 1;
      }

      return counts;
    },
    {
      verified: 0,
      conflict: 0,
      singleSource: 0,
      pending: 0,
      modelled: 0
    }
  );
}

function getOverallStatus(fields: VerificationFieldRecord[]): VerificationStatus {
  if (fields.some((field) => field.status === "conflict")) {
    return "conflict";
  }

  if (fields.some((field) => field.status === "pending")) {
    return "pending";
  }

  if (fields.some((field) => field.status === "single-source")) {
    return "single-source";
  }

  if (fields.every((field) => field.status === "modelled")) {
    return "modelled";
  }

  return "verified";
}

function buildReport(
  kind: VerificationReport["kind"],
  summary: string,
  sources: VerificationSourceRecord[],
  fields: VerificationFieldRecord[],
  notes: string[]
): VerificationReport {
  return {
    kind,
    overallStatus: getOverallStatus(fields),
    summary,
    sources,
    fields,
    notes,
    counts: tallyCounts(fields)
  };
}

function compareTextField(
  id: string,
  label: string,
  localValue: string | undefined,
  remoteValue: string | undefined,
  sourceLabels: { local: string; remote: string },
  options?: {
    note?: string;
    localSourceId?: string;
    remoteSourceId?: string;
  }
) {
  const normalizedLocal = normalizeText(localValue ?? "");
  const normalizedRemote = normalizeText(remoteValue ?? "");
  const localDisplay = normalizedLocal || "n/a";
  const remoteDisplay = normalizedRemote || "n/a";
  const localSourceId = options?.localSourceId ?? "catalog";
  const remoteSourceId = options?.remoteSourceId ?? "remote";

  if (!normalizedRemote) {
    return createField(
      id,
      label,
      "single-source",
      localDisplay,
      [createObservation(localSourceId, sourceLabels.local, localDisplay)],
      options?.note ?? "Only one source currently provides this field."
    );
  }

  return createField(
    id,
    label,
    normalizedLocal.toLowerCase() === normalizedRemote.toLowerCase() ? "verified" : "conflict",
    localDisplay,
    [
      createObservation(localSourceId, sourceLabels.local, localDisplay),
      createObservation(remoteSourceId, sourceLabels.remote, remoteDisplay)
    ],
    options?.note
  );
}

function compareNumberField(
  id: string,
  label: string,
  localValue: number | undefined,
  remoteValue: number | undefined,
  digits: number,
  tolerance: number,
  sourceLabels: { local: string; remote: string },
  options?: {
    note?: string;
    localSourceId?: string;
    remoteSourceId?: string;
  }
) {
  const localDisplay = formatMaybeNumber(localValue, digits);
  const remoteDisplay = formatMaybeNumber(remoteValue, digits);
  const localSourceId = options?.localSourceId ?? "catalog";
  const remoteSourceId = options?.remoteSourceId ?? "remote";

  if (typeof remoteValue !== "number") {
    return createField(
      id,
      label,
      "single-source",
      localDisplay,
      [createObservation(localSourceId, sourceLabels.local, localDisplay)],
      options?.note ?? "Only one source currently provides this field."
    );
  }

  const status = typeof localValue === "number" && Math.abs(localValue - remoteValue) <= tolerance ? "verified" : "conflict";
  return createField(
    id,
    label,
    status,
    localDisplay,
    [
      createObservation(localSourceId, sourceLabels.local, localDisplay),
      createObservation(remoteSourceId, sourceLabels.remote, remoteDisplay)
    ],
    options?.note
  );
}

function createSingleSourceField(
  id: string,
  label: string,
  value: string,
  source: { id: string; label: string },
  note?: string
) {
  return createField(id, label, "single-source", value, [createObservation(source.id, source.label, value)], note);
}

function fetchPubChemPropertyRecord(cid: number) {
  return fetch(getPubChemPropertyUrl(cid, moleculePropertyFields), {
    headers: {
      "User-Agent": "chemie-engine/0.1"
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`PubChem property request failed: ${response.status}`);
      }

      return response.json();
    })
    .then((payload: PubChemPropertyResponse) => payload.PropertyTable?.Properties?.[0] ?? null);
}

export async function fetchMoleculeVerificationReport(molecule: MoleculeRecord): Promise<VerificationReport> {
  if (moleculeVerificationCache.has(molecule.id)) {
    return moleculeVerificationCache.get(molecule.id)!;
  }

  const request: Promise<VerificationReport> = (async () => {
    const catalogSource = {
      id: "catalog",
      label: "Catalog snapshot"
    };

    if (!molecule.pubchemCid) {
      const singleSourceFields = [
        createSingleSourceField("formula", "Formula", molecule.formula, catalogSource),
        createSingleSourceField("iupac", "IUPAC name", molecule.iupac, catalogSource),
        createSingleSourceField("molecularWeight", "Molecular weight", `${molecule.molecularWeight.toFixed(2)} g/mol`, catalogSource),
        createSingleSourceField("categories", "Categories", molecule.categories.join(", "), catalogSource, "Category tags are currently curated in-app."),
        createSingleSourceField("uses", "Use cases", `${molecule.uses.length} curated tags`, catalogSource, "Use cases are currently curated in-app."),
        createSingleSourceField("description", "Description", "Curated dossier text", catalogSource)
      ];

      return buildReport(
        "molecule",
        "This molecule currently has only one linked record in the app, so disagreements cannot be checked yet.",
        [
          {
            id: "catalog",
            label: "Catalog snapshot",
            detail: "Single in-app chemistry record.",
            state: "checked"
          }
        ],
        singleSourceFields,
        ["Link a PubChem CID or another external identifier to enable cross-source verification."]
      );
    }

    try {
      const liveRecord = await fetchPubChemPropertyRecord(molecule.pubchemCid);
      const fields = [
        compareTextField("formula", "Formula", molecule.formula, liveRecord?.MolecularFormula, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareTextField("iupac", "IUPAC name", molecule.iupac, liveRecord?.IUPACName, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("molecularWeight", "Molecular weight", molecule.molecularWeight, liveRecord?.MolecularWeight, 2, 0.05, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("exactMass", "Exact mass", molecule.exactMass, liveRecord?.ExactMass, 3, 0.01, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("xlogp", "XLogP", molecule.xlogp, liveRecord?.XLogP, 2, 0.1, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("tpsa", "TPSA", molecule.tpsa, liveRecord?.TPSA, 2, 0.1, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("hBondDonors", "H-bond donors", molecule.hBondDonors, liveRecord?.HBondDonorCount, 0, 0, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("hBondAcceptors", "H-bond acceptors", molecule.hBondAcceptors, liveRecord?.HBondAcceptorCount, 0, 0, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("charge", "Formal charge", molecule.charge, liveRecord?.Charge, 0, 0, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        compareNumberField("complexity", "Complexity", molecule.complexity, liveRecord?.Complexity, 0, 1, {
          local: "Catalog snapshot",
          remote: "PubChem live"
        }),
        createSingleSourceField(
          "categories",
          "Categories",
          molecule.categories.join(", "),
          catalogSource,
          "Category tags are currently app-curated and not yet cross-mapped to an external ontology."
        ),
        createSingleSourceField(
          "uses",
          "Use cases",
          `${molecule.uses.length} curated tags`,
          catalogSource,
          "Use-case labels are currently editorial rather than externally verified."
        ),
        createSingleSourceField("description", "Description", "Curated dossier text", catalogSource, "Narrative dossier text is currently written in-app.")
      ];
      const conflicts = fields.filter((field) => field.status === "conflict").length;

      return buildReport(
        "molecule",
        conflicts > 0
          ? "The molecule record contains cross-source disagreements that should be reviewed before treating every value as settled."
          : "Cross-source comparison between the catalog snapshot and the live PubChem property feed is currently aligned for the compared chemistry fields.",
        [
          {
            id: "catalog",
            label: "Catalog snapshot",
            detail: "Locally generated molecule record used by the app.",
            state: "checked"
          },
          {
            id: "pubchem-live",
            label: "PubChem live properties",
            detail: "Live compound property feed used for cross-checking core descriptors.",
            state: "checked",
            url: getPubChemCompoundUrl(molecule.pubchemCid)
          }
        ],
        fields,
        conflicts > 0
          ? ["Conflicts often indicate drift between the generated catalog snapshot and the current external source, or an upstream source-definition difference."]
          : ["Fields without an external counterpart remain marked as single-source rather than fully verified."]
      );
    } catch {
      const fields = [
        createField(
          "formula",
          "Formula",
          "pending",
          molecule.formula,
          [createObservation("catalog", "Catalog snapshot", molecule.formula)],
          "The live PubChem check failed, so this field could not be cross-verified in this session."
        ),
        createField(
          "molecularWeight",
          "Molecular weight",
          "pending",
          `${molecule.molecularWeight.toFixed(2)} g/mol`,
          [createObservation("catalog", "Catalog snapshot", `${molecule.molecularWeight.toFixed(2)} g/mol`)],
          "The live PubChem check failed, so this field could not be cross-verified in this session."
        ),
        createSingleSourceField("categories", "Categories", molecule.categories.join(", "), catalogSource)
      ];

      return buildReport(
        "molecule",
        "The molecule has an external source link, but the live comparison failed in this session, so cross-source verification is currently incomplete.",
        [
          {
            id: "catalog",
            label: "Catalog snapshot",
            detail: "Locally generated molecule record used by the app.",
            state: "checked"
          },
          {
            id: "pubchem-live",
            label: "PubChem live properties",
            detail: "Live external verification target for core molecular descriptors.",
            state: "failed",
            url: getPubChemCompoundUrl(molecule.pubchemCid)
          }
        ],
        fields,
        ["Retry the live lookup or inspect the linked PubChem record directly before treating these fields as cross-verified."]
      );
    }
  })();

  moleculeVerificationCache.set(molecule.id, request);
  return request;
}

function normalizedAtomCategory(value: string) {
  return value.replace(/^unknown, probably /, "").replace("polyatomic nonmetal", "nonmetal").replace("diatomic nonmetal", "nonmetal");
}

export function getAtomVerificationReport(atom: AtomRecord): VerificationReport {
  const periodicReference = periodicElementByNumber.get(atom.atomicNumber);
  const curatedReference = curatedAtomSeedByNumber.get(atom.atomicNumber);
  const sources: VerificationSourceRecord[] = [
    {
      id: "periodic-reference",
      label: "Periodic table dataset",
      detail: "Baseline periodic metadata used to populate all 118 elements.",
      state: "checked"
    }
  ];

  if (curatedReference) {
    sources.push({
      id: "curated-atom-seed",
      label: "Curated atom seed",
      detail: "Higher-depth local record layered over the periodic-table baseline.",
      state: "checked"
    });
  }

  sources.push({
    id: "nist-reference",
    label: "NIST / CIAAW references",
    detail: "External reference targets for later source-backed atom enrichment.",
    state: "reference"
  });

  const fields: VerificationFieldRecord[] = [];

  if (periodicReference && curatedReference) {
    fields.push(
      compareNumberField(
        "atomicWeight",
        "Atomic weight",
        curatedReference.atomicWeight,
        periodicReference.atomicWeight,
        3,
        0.01,
        {
          local: "Curated atom seed",
          remote: "Periodic table dataset"
        },
        {
          localSourceId: "curated-atom-seed",
          remoteSourceId: "periodic-reference",
          note: "Small rounding differences are tolerated."
        }
      )
    );
    fields.push(
      compareTextField(
        "category",
        "Category",
        normalizedAtomCategory(curatedReference.category),
        normalizedAtomCategory(periodicReference.category),
        {
          local: "Curated atom seed",
          remote: "Periodic table dataset"
        },
        {
          localSourceId: "curated-atom-seed",
          remoteSourceId: "periodic-reference"
        }
      )
    );
    fields.push(
      compareTextField(
        "phase",
        "Standard phase",
        curatedReference.phase,
        periodicReference.phase,
        {
          local: "Curated atom seed",
          remote: "Periodic table dataset"
        },
        {
          localSourceId: "curated-atom-seed",
          remoteSourceId: "periodic-reference"
        }
      )
    );
    fields.push(
      compareTextField(
        "periodGroup",
        "Period / group",
        `${curatedReference.period} / ${curatedReference.group}`,
        `${periodicReference.period} / ${periodicReference.group}`,
        {
          local: "Curated atom seed",
          remote: "Periodic table dataset"
        },
        {
          localSourceId: "curated-atom-seed",
          remoteSourceId: "periodic-reference"
        }
      )
    );
    fields.push(
      createSingleSourceField(
        "electronConfiguration",
        "Electron configuration",
        curatedReference.electronConfiguration,
        { id: "curated-atom-seed", label: "Curated atom seed" },
        "Electron configuration text is currently sourced from the curated atom layer only."
      )
    );
    fields.push(
      createSingleSourceField(
        "oxidationStates",
        "Oxidation states",
        curatedReference.oxidationStates.join(", "),
        { id: "curated-atom-seed", label: "Curated atom seed" },
        "Oxidation states are currently available only in the curated atom layer."
      )
    );
  } else if (periodicReference) {
    fields.push(
      createSingleSourceField(
        "atomicWeight",
        "Atomic weight",
        periodicReference.atomicWeight.toFixed(3),
        { id: "periodic-reference", label: "Periodic table dataset" }
      ),
      createSingleSourceField(
        "category",
        "Category",
        normalizedAtomCategory(periodicReference.category),
        { id: "periodic-reference", label: "Periodic table dataset" }
      ),
      createSingleSourceField(
        "phase",
        "Standard phase",
        periodicReference.phase,
        { id: "periodic-reference", label: "Periodic table dataset" }
      ),
      createField(
        "electronConfiguration",
        "Electron configuration",
        "pending",
        atom.electronConfiguration,
        [createObservation("periodic-reference", "Periodic table dataset", "reference pending")],
        "This element is present in the full table, but it does not yet have a second curated source layer."
      )
    );
  }

  fields.push(
    createSingleSourceField(
      "description",
      "Dossier description",
      atom.coverage === "curated" ? "Curated narrative" : "Reference narrative",
      { id: atom.coverage === "curated" ? "curated-atom-seed" : "periodic-reference", label: atom.coverage === "curated" ? "Curated atom seed" : "Periodic table dataset" },
      "Narrative atom descriptions are currently editorial and should be treated separately from measured metadata."
    )
  );

  const conflicts = fields.filter((field) => field.status === "conflict").length;
  return buildReport(
    "atom",
    conflicts > 0
      ? "This atom record contains disagreements between the curated atom layer and the periodic-table reference layer."
      : atom.coverage === "curated"
        ? "This atom record combines a curated layer with periodic-table reference metadata. Core fields currently align unless explicitly flagged."
        : "This atom currently relies on the periodic-table baseline only, so the record is transparent about being single-source."
    ,
    sources,
    fields,
    [
      atom.coverage === "curated"
        ? "The merged atom record prefers curated values when available, but disagreements are surfaced explicitly."
        : "Add richer external atom sources to move this record from single-source to cross-verified."
    ]
  );
}

function parseFormula(formula: string) {
  const ledger = new Map<string, number>();

  for (const match of formula.matchAll(formulaTokenPattern)) {
    const symbol = match[1];
    const count = Number(match[2] || "1");
    ledger.set(symbol, (ledger.get(symbol) ?? 0) + count);
  }

  return ledger;
}

function addLedger(target: Map<string, number>, formula: string, direction: 1 | -1) {
  const parsed = parseFormula(formula);
  for (const [symbol, count] of parsed) {
    target.set(symbol, (target.get(symbol) ?? 0) + count * direction);
  }
}

function formatLedger(ledger: Map<string, number>) {
  return [...ledger.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([symbol, count]) => `${symbol}:${count}`)
    .join(", ");
}

function createReactionAtomBalanceField(reaction: ReactionRecord, molecules: MoleculeRecord[]) {
  const participantMap = new Map(molecules.map((molecule) => [molecule.id, molecule]));
  const reactantLedger = new Map<string, number>();
  const productLedger = new Map<string, number>();

  reaction.reactants.forEach((moleculeId) => {
    const molecule = participantMap.get(moleculeId);
    if (molecule) {
      addLedger(reactantLedger, molecule.formula, 1);
    }
  });

  reaction.products.forEach((moleculeId) => {
    const molecule = participantMap.get(moleculeId);
    if (molecule) {
      addLedger(productLedger, molecule.formula, 1);
    }
  });

  const delta = new Map<string, number>();
  const keys = unique([...reactantLedger.keys(), ...productLedger.keys()]);
  keys.forEach((symbol) => {
    const difference = (productLedger.get(symbol) ?? 0) - (reactantLedger.get(symbol) ?? 0);
    if (difference !== 0) {
      delta.set(symbol, difference);
    }
  });

  return createField(
    "atomBalance",
    "Atom balance",
    delta.size === 0 ? "verified" : "conflict",
    delta.size === 0 ? "Balanced under 1:1 participant counting" : `Delta ${formatLedger(delta)}`,
    [
      createObservation("reaction-seed", "Reaction seed", `Reactants ${formatLedger(reactantLedger) || "none"}`),
      createObservation("reaction-seed", "Reaction seed", `Products ${formatLedger(productLedger) || "none"}`)
    ],
    "This check assumes coefficient 1 for each listed participant, so simplified seed reactions can legitimately appear unbalanced."
  );
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

export function getReactionVerificationReport(reaction: ReactionRecord, molecules: MoleculeRecord[]): VerificationReport {
  const linkedPubChem = molecules.filter((molecule) => molecule.pubchemCid).length;
  const fields: VerificationFieldRecord[] = [
    createReactionAtomBalanceField(reaction, molecules),
    createField(
      "participantCoverage",
      "Participant source coverage",
      linkedPubChem === molecules.length ? "verified" : "pending",
      `${linkedPubChem}/${molecules.length} participant molecules linked to PubChem`,
      [
        createObservation("reaction-seed", "Reaction seed", `${molecules.length} total participants`),
        createObservation("participant-sources", "Participant records", `${linkedPubChem} with PubChem CID`)
      ],
      "Reaction verification quality improves as more participant molecules are linked to external identifiers."
    ),
    createSingleSourceField(
      "conditions",
      "Conditions and notes",
      `${reaction.temperature ?? "temperature not specified"}; ${reaction.solvent ?? "solvent not specified"}`,
      { id: "reaction-seed", label: "Reaction seed" },
      "Reaction conditions are currently curated in-app and not yet matched to an exact external record."
    ),
    createField(
      "externalMatch",
      "External curated match",
      "pending",
      "No exact Rhea or ORD record linked yet",
      [createObservation("reaction-sources", "External references", "Search links available, exact record mapping pending")],
      "Search entry points exist, but the app does not yet store a proven exact external reaction identifier."
    ),
    createField(
      "playbackExactness",
      "Playback exactness",
      "modelled",
      "Modelled structural transition",
      [createObservation("reaction-theatre", "Reaction theatre", "Animation is not yet atom-mapped mechanistic truth")],
      "The theatre remains an interpretive visual layer until exact atom mapping is attached."
    )
  ];
  const conflicts = fields.filter((field) => field.status === "conflict").length;

  return buildReport(
    "reaction",
    conflicts > 0
      ? "This reaction record has unresolved consistency issues, typically atom-balance mismatches caused by simplified seed participants or missing stoichiometry."
      : "This reaction record is internally coherent for the checks currently implemented, while still distinguishing source-backed facts from modelled playback.",
    [
      {
        id: "reaction-seed",
        label: "Reaction seed",
        detail: "Primary in-app reaction record.",
        state: "checked"
      },
      {
        id: "participant-sources",
        label: "Participant molecule records",
        detail: "Compound sources linked through the molecules participating in this reaction.",
        state: linkedPubChem === molecules.length ? "checked" : "pending"
      },
      {
        id: "rhea-reference",
        label: "Rhea search",
        detail: "Curated external reaction search target.",
        state: "reference",
        url: `https://www.rhea-db.org/searchresults?q=${encodeURIComponent(reaction.name)}`
      },
      {
        id: "ord-reference",
        label: "Open Reaction Database",
        detail: "Open external reaction corpus for later exact record linking.",
        state: "reference",
        url: "https://open-reaction-database.org/"
      }
    ],
    fields,
    [
      "Reaction disagreements are surfaced separately from the visual theatre, so modelled playback does not masquerade as verified mechanistic truth.",
      "The next quality step is storing exact external reaction identifiers and stoichiometric coefficients."
    ]
  );
}
