import type {
  MoleculeRecord,
  MoleculeSafetyRecord,
  ReactionRecord,
  ReactionSafetyRecord,
  ReactionParticipantSafetyRecord,
  SafetyPictogram,
  SafetyPropertyRecord,
  SafetySourceReference,
  SafetyStatement
} from "../types/chemistry";
import {
  getPubChemCompoundUrl,
  getPubChemGhsCodeTableUrl,
  getPubChemGhsCodeUrl,
  getPubChemPugViewDataUrl,
  getPubChemViewUrl
} from "./pubchem";
import { downloadPdfDocument } from "./pdf";
import { getSafeExternalHref } from "./urls";

interface PubChemMarkup {
  URL?: string;
  Type?: string;
  Extra?: string;
}

interface PubChemStringValue {
  String?: string;
  Markup?: PubChemMarkup[];
}

interface PubChemInformation {
  ReferenceNumber?: number;
  Name?: string;
  Value?: {
    StringWithMarkup?: PubChemStringValue[];
  };
}

interface PubChemSection {
  TOCHeading?: string;
  Section?: PubChemSection[];
  Information?: PubChemInformation[];
}

interface PubChemReference {
  ReferenceNumber?: number;
  SourceName?: string;
  Name?: string;
  URL?: string;
  Description?: string;
}

interface PubChemRecordResponse {
  Record?: {
    Section?: PubChemSection[];
    Reference?: PubChemReference[];
  };
}

const GHS_CODE_PATTERN = /[HP]\d{3}(?:\+P\d{3})*/g;
const signalPriority = new Map([
  ["Danger", 3],
  ["Warning", 2],
  ["Caution", 1]
]);
const moleculeSafetyCache = new Map<string, Promise<MoleculeSafetyRecord>>();
let ghsCodeLookupPromise: Promise<Map<string, string>> | null = null;

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function dedupeStatements(statements: SafetyStatement[]) {
  const byCode = new Map<string, SafetyStatement>();

  for (const statement of statements) {
    const current = byCode.get(statement.code);
    if (!current || statement.text.length < current.text.length) {
      byCode.set(statement.code, statement);
    }
  }

  return [...byCode.values()];
}

function buildReferenceMap(response?: PubChemRecordResponse) {
  return new Map(
    (response?.Record?.Reference ?? [])
      .filter((reference): reference is PubChemReference & { ReferenceNumber: number } => typeof reference.ReferenceNumber === "number")
      .map((reference) => [reference.ReferenceNumber, reference])
  );
}

function extractInfoStrings(info?: PubChemInformation) {
  return (info?.Value?.StringWithMarkup ?? [])
    .map((item) => normalizeText(item.String ?? ""))
    .filter(Boolean);
}

function extractPictograms(infoEntries: PubChemInformation[]) {
  const pictogramMap = new Map<string, SafetyPictogram>();

  for (const info of infoEntries.filter((entry) => entry.Name === "Pictogram(s)")) {
    for (const stringValue of info.Value?.StringWithMarkup ?? []) {
      for (const markup of stringValue.Markup ?? []) {
        if (markup.Type !== "Icon" || !markup.URL) {
          continue;
        }

        const safeUrl = getSafeExternalHref(markup.URL);
        if (!safeUrl) {
          continue;
        }

        const code = markup.URL.match(/(GHS\d+)/)?.[1] ?? markup.Extra ?? markup.URL;
        if (!pictogramMap.has(code)) {
          pictogramMap.set(code, {
            code,
            label: markup.Extra ?? code,
            url: safeUrl
          });
        }
      }
    }
  }

  return [...pictogramMap.values()];
}

function extractSignalWord(infoEntries: PubChemInformation[]) {
  const candidates = infoEntries
    .filter((entry) => entry.Name === "Signal")
    .flatMap((entry) => extractInfoStrings(entry))
    .filter(Boolean);

  return candidates.sort(
    (left, right) => (signalPriority.get(right) ?? 0) - (signalPriority.get(left) ?? 0)
  )[0];
}

function parseHazardStatement(raw: string): SafetyStatement | null {
  const normalized = normalizeText(raw);
  const codeMatch = normalized.match(/^(H\d{3}[A-Z]?)/);
  if (!codeMatch) {
    return null;
  }

  const code = codeMatch[1];
  const tail = normalized.includes(":")
    ? normalized.slice(normalized.indexOf(":") + 1)
    : normalized.replace(codeMatch[0], "");
  const text = normalizeText(
    tail
      .replace(/^\([^)]*\)\s*/, "")
      .replace(/\[[^\]]+\]/g, "")
  );

  if (!text) {
    return null;
  }

  return {
    code,
    text,
    url: getPubChemGhsCodeUrl(code)
  };
}

async function getGhsCodeLookup() {
  if (!ghsCodeLookupPromise) {
    ghsCodeLookupPromise = fetch(getPubChemGhsCodeTableUrl())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load GHS phrase table: ${response.status}`);
        }

        return response.text();
      })
      .then((table) => {
        const lookup = new Map<string, string>();
        for (const row of table.split(/\r?\n/).slice(1)) {
          const columns = row.split("\t");
          const code = normalizeText(columns[0] ?? "");
          const text = normalizeText(columns[1] ?? "");

          if ((code.startsWith("H") || code.startsWith("P")) && text && !lookup.has(code)) {
            lookup.set(code, text);
          }
        }
        return lookup;
      });
  }

  return ghsCodeLookupPromise;
}

function findSectionByHeading(sections: PubChemSection[] | undefined, heading: string): PubChemSection | null {
  for (const section of sections ?? []) {
    if (section.TOCHeading === heading) {
      return section;
    }

    const nested = findSectionByHeading(section.Section, heading);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function extractPrecautionaryStatements(infoEntries: PubChemInformation[], ghsLookup: Map<string, string>) {
  const codes = unique(
    infoEntries
      .filter((entry) => entry.Name === "Precautionary Statement Codes")
      .flatMap((entry) => extractInfoStrings(entry))
      .flatMap((value) => value.match(GHS_CODE_PATTERN) ?? [])
      .filter((code) => code.startsWith("P"))
  );

  return codes.map((code) => ({
    code,
    text: ghsLookup.get(code) ?? "See PubChem GHS reference for the current precautionary phrase.",
    url: getPubChemGhsCodeUrl(code)
  }));
}

function scorePropertyValue(label: string, value: string) {
  let score = 0;

  if (/\d/.test(value)) {
    score += 18;
  }

  if (/°|deg|g\/|kg\/|mm hg|kpa|pa|atm|miscible|soluble|liquid|solid|gas|odor|vapou?r/i.test(value)) {
    score += 18;
  }

  if (label === "Physical Description" && /(appears|colorless|odor|liquid|solid|vapou?r|gas)/i.test(value)) {
    score += 24;
  }

  if (/standard|reference standard|certified|quality|usp|ukas|thesafetydirector/i.test(value)) {
    score -= 40;
  }

  if (value.length > 180) {
    score -= 18;
  }

  return score - value.length / 20;
}

function pickBestProperty(section: PubChemSection, referenceMap: Map<number, PubChemReference>) {
  const label = section.TOCHeading ?? "Property";
  const candidates = (section.Information ?? [])
    .flatMap((info) =>
      extractInfoStrings(info).map((value) => ({
        value,
        referenceNumber: info.ReferenceNumber
      }))
    )
    .filter((candidate) => candidate.value);

  if (candidates.length === 0) {
    return null;
  }

  const best = [...candidates].sort(
    (left, right) => scorePropertyValue(label, right.value) - scorePropertyValue(label, left.value)
  )[0];
  const source = best.referenceNumber ? referenceMap.get(best.referenceNumber)?.SourceName : undefined;

  return {
    label,
    value: best.value,
    source
  } satisfies SafetyPropertyRecord;
}

function getFallbackPhysicalProperties(molecule: MoleculeRecord) {
  return [
    {
      label: "Molecular weight",
      value: `${molecule.molecularWeight.toFixed(2)} g/mol`,
      source: "Catalog descriptors"
    },
    molecule.exactMass
      ? {
          label: "Exact mass",
          value: `${molecule.exactMass.toFixed(3)} Da`,
          source: "Catalog descriptors"
        }
      : null,
    molecule.xlogp != null
      ? {
          label: "XLogP",
          value: `${molecule.xlogp}`,
          source: "Catalog descriptors"
        }
      : null,
    molecule.tpsa != null
      ? {
          label: "TPSA",
          value: `${molecule.tpsa} A^2`,
          source: "Catalog descriptors"
        }
      : null
  ].filter(isDefined);
}

export function getFallbackMoleculeSafetyRecord(molecule: MoleculeRecord): MoleculeSafetyRecord {
  const hasRemoteSource = Boolean(molecule.pubchemCid);
  const sourceLinks: SafetySourceReference[] = molecule.pubchemCid
    ? [
        {
          label: "PubChem compound record",
          url: getPubChemCompoundUrl(molecule.pubchemCid),
          kind: "reference"
        },
        {
          label: "PubChem safety and hazards",
          url: getPubChemViewUrl(molecule.pubchemCid, "Safety and Hazards"),
          kind: "safety"
        }
      ]
    : [];

  return {
    status: hasRemoteSource ? "summary-only" : "source-unavailable",
    sourceLabel: hasRemoteSource ? "Catalog summary while live PubChem safety data loads" : "Catalog summary only",
    summary: hasRemoteSource
      ? "Live PubChem safety, GHS and experimental property lookups are available for this compound."
      : "No source-backed safety feed is linked to this compound yet.",
    pictograms: [],
    hazardStatements: [],
    precautionaryStatements: [],
    physicalProperties: getFallbackPhysicalProperties(molecule),
    handlingNotes: unique([
      ...molecule.hazardNotes,
      `Always verify the current supplier SDS before handling ${molecule.name}.`
    ]),
    sourceLinks,
    note: hasRemoteSource
      ? "Until the live record is loaded, this sheet only shows catalog notes and descriptors."
      : "Attach a source-backed registry record to enrich this safety sheet."
  };
}

function buildSourceLinks(
  molecule: MoleculeRecord,
  referenceNumbers: number[],
  referenceMap: Map<number, PubChemReference>
) {
  const sourceMap = new Map<string, SafetySourceReference>();

  if (molecule.pubchemCid) {
    sourceMap.set("pubchem-compound", {
      label: "PubChem compound record",
      url: getPubChemCompoundUrl(molecule.pubchemCid),
      kind: "reference"
    });
    sourceMap.set("pubchem-safety", {
      label: "PubChem safety and hazards",
      url: getPubChemViewUrl(molecule.pubchemCid, "Safety and Hazards"),
      kind: "safety"
    });
    sourceMap.set("pubchem-physical", {
      label: "PubChem experimental properties",
      url: getPubChemViewUrl(molecule.pubchemCid, "Chemical and Physical Properties"),
      kind: "physical"
    });
  }

  for (const referenceNumber of unique(referenceNumbers)) {
    const reference = referenceMap.get(referenceNumber);
    if (!reference?.URL) {
      continue;
    }

    const safeUrl = getSafeExternalHref(reference.URL);
    if (!safeUrl) {
      continue;
    }

    sourceMap.set(`ref-${referenceNumber}`, {
      label: reference.SourceName ?? reference.Name ?? `Reference ${referenceNumber}`,
      url: safeUrl,
      kind: safeUrl.includes("eur-lex") || safeUrl.includes("echa") ? "regulatory" : "reference"
    });
  }

  return [...sourceMap.values()];
}

function mergePhysicalProperties(
  sourceBacked: SafetyPropertyRecord[],
  fallback: SafetyPropertyRecord[]
) {
  const propertyMap = new Map<string, SafetyPropertyRecord>();

  for (const property of [...sourceBacked, ...fallback]) {
    if (!propertyMap.has(property.label)) {
      propertyMap.set(property.label, property);
    }
  }

  return [...propertyMap.values()];
}

function getPropertySections(sections: PubChemSection[] | undefined) {
  const experimental = findSectionByHeading(sections, "Experimental Properties");
  const candidates = (experimental?.Section ?? []).filter((section) =>
    [
      "Physical Description",
      "Boiling Point",
      "Melting Point",
      "Density",
      "Flash Point",
      "Vapor Pressure",
      "Solubility"
    ].includes(section.TOCHeading ?? "")
  );

  return candidates;
}

function detectHazardFlags(texts: string[]) {
  const joined = texts.join(" ").toLowerCase();
  return {
    flammable: /flammable|flash point|ignition|combust/.test(joined),
    corrosive: /corros/.test(joined),
    irritant: /irrit|eye damage|skin damage/.test(joined),
    toxic: /toxic|fatal|carcin|mutagen|reprotox|sensiti/.test(joined),
    gas: /gas|pressure|asphyxi/.test(joined)
  };
}

export async function fetchMoleculeSafetyRecord(molecule: MoleculeRecord): Promise<MoleculeSafetyRecord> {
  if (moleculeSafetyCache.has(molecule.id)) {
    return moleculeSafetyCache.get(molecule.id)!;
  }

  const request: Promise<MoleculeSafetyRecord> = (async () => {
    const fallback = getFallbackMoleculeSafetyRecord(molecule);
    if (!molecule.pubchemCid) {
      return fallback;
    }

    try {
      const [ghsLookup, safetyResponse, propertiesResponse] = await Promise.all([
        getGhsCodeLookup(),
        fetch(getPubChemPugViewDataUrl(molecule.pubchemCid, "Safety and Hazards")),
        fetch(getPubChemPugViewDataUrl(molecule.pubchemCid, "Experimental Properties"))
      ]);

      if (!safetyResponse.ok || !propertiesResponse.ok) {
        throw new Error(`PubChem safety lookup failed for ${molecule.name}`);
      }

      const [safetyData, propertiesData] = (await Promise.all([
        safetyResponse.json(),
        propertiesResponse.json()
      ])) as [PubChemRecordResponse, PubChemRecordResponse];

      const referenceMap = buildReferenceMap(safetyData);
      const ghsSection = findSectionByHeading(safetyData.Record?.Section, "GHS Classification");
      const infoEntries = ghsSection?.Information ?? [];
      const referencedNumbers = infoEntries
        .map((entry) => entry.ReferenceNumber)
        .filter((value): value is number => typeof value === "number");

      const pictograms = extractPictograms(infoEntries);
      const signalWord = extractSignalWord(infoEntries);
      const hazardStatements = dedupeStatements(
        infoEntries
          .filter((entry) => entry.Name === "GHS Hazard Statements")
          .flatMap((entry) => extractInfoStrings(entry))
          .map(parseHazardStatement)
          .filter(isDefined)
      );
      const precautionaryStatements = dedupeStatements(extractPrecautionaryStatements(infoEntries, ghsLookup));
      const propertiesReferenceMap = buildReferenceMap(propertiesData);
      const physicalProperties = getPropertySections(propertiesData.Record?.Section)
        .map((section) => pickBestProperty(section, propertiesReferenceMap))
        .filter(isDefined);

      return {
        status: hazardStatements.length > 0 || precautionaryStatements.length > 0 ? "source-backed" : "summary-only",
        sourceLabel: "PubChem Safety and Hazards + Experimental Properties",
        summary:
          hazardStatements.length > 0
            ? `Source-backed GHS summary synced from PubChem for ${molecule.name}.`
            : `PubChem returned only a partial safety record for ${molecule.name}.`,
        signalWord,
        pictograms,
        hazardStatements,
        precautionaryStatements,
        physicalProperties: mergePhysicalProperties(physicalProperties, fallback.physicalProperties),
        handlingNotes: unique([
          ...molecule.hazardNotes,
          "Verify the current supplier SDS before experimental use or scale-up."
        ]),
        sourceLinks: buildSourceLinks(molecule, referencedNumbers, referenceMap),
        note:
          referencedNumbers.length > 1
            ? "PubChem aggregates multiple notifier and regulatory sources. Exact classification can vary by grade, concentration and notifier."
            : "Use this in-app summary as a reference layer, not as a replacement for the current supplier SDS.",
        fetchedAt: new Date().toISOString()
      } satisfies MoleculeSafetyRecord;
    } catch {
      return {
        ...fallback,
        note: "Live PubChem safety lookup failed. Review the linked PubChem record or a supplier SDS before use."
      } satisfies MoleculeSafetyRecord;
    }
  })();

  moleculeSafetyCache.set(molecule.id, request);
  return request;
}

export async function fetchMoleculeSafetyRecords(molecules: MoleculeRecord[]) {
  const entries = await Promise.all(
    molecules.map(async (molecule) => [molecule.id, await fetchMoleculeSafetyRecord(molecule)] as const)
  );

  return Object.fromEntries(entries) as Record<string, MoleculeSafetyRecord>;
}

export function buildReactionSafetyRecord(
  reaction: ReactionRecord,
  molecules: MoleculeRecord[],
  safetyRecords: Record<string, MoleculeSafetyRecord>
): ReactionSafetyRecord {
  const participants: ReactionParticipantSafetyRecord[] = molecules.map((molecule) => {
    const safety = safetyRecords[molecule.id] ?? getFallbackMoleculeSafetyRecord(molecule);
    return {
      moleculeId: molecule.id,
      moleculeName: molecule.name,
      status: safety.status,
      signalWord: safety.signalWord,
      pictograms: safety.pictograms,
      hazardStatements: safety.hazardStatements.slice(0, 3),
      precautionaryStatements: safety.precautionaryStatements.slice(0, 3)
    };
  });

  const participantTexts = molecules.flatMap((molecule) => {
    const safety = safetyRecords[molecule.id] ?? getFallbackMoleculeSafetyRecord(molecule);
    return [
      ...molecule.hazardNotes,
      ...safety.hazardStatements.map((statement) => statement.text),
      ...safety.precautionaryStatements.map((statement) => statement.text)
    ];
  });
  const flags = detectHazardFlags(participantTexts);
  const heatedProcess = Boolean(reaction.temperature && !/not specified/i.test(reaction.temperature));
  const pressureRelevant = /pressure|gas|combustion|oxidation/i.test(
    [...reaction.categories, reaction.temperature ?? "", reaction.notes].join(" ").toLowerCase()
  );

  const primaryHazards = unique(
    [
      flags.flammable || reaction.categories.includes("combustion")
        ? "Ignition, vapor and fire control are primary hazards in this reaction setup."
        : null,
      flags.corrosive
        ? "Corrosive feeds or byproducts require compatibility checks for contact surfaces and quench handling."
        : null,
      flags.toxic
        ? "Exposure control matters because one or more participants carry toxic, chronic or sensitizing hazards."
        : null,
      flags.irritant
        ? "Splash, dust or vapor irritation remains relevant even when the reaction is operationally simple."
        : null,
      pressureRelevant || flags.gas
        ? "Pressure relief, venting and gas handling should be reviewed before any scale-up."
        : null,
      heatedProcess
        ? "Thermal control and rate of heat release should be treated as process-critical."
        : null
    ].filter((item): item is string => Boolean(item))
  );

  const controls = unique(
    [
      "Verify ventilation and enclosure strategy before running the reaction.",
      flags.flammable || reaction.categories.includes("combustion")
        ? "Remove ignition sources and ground equipment before charging flammable participants."
        : null,
      flags.corrosive
        ? "Use corrosion-compatible glassware, tubing and waste containers for acidic or corrosive streams."
        : null,
      heatedProcess
        ? "Stage addition order, cooling capacity and quench planning before scale-up."
        : null,
      reaction.catalysts.length > 0
        ? "Check catalyst handling, contamination sensitivity and deactivation pathways before use."
        : null,
      pressureRelevant
        ? "Confirm vent routing and pressure management before sealing or heating the system."
        : null
    ].filter((item): item is string => Boolean(item))
  );

  const ppe = unique(
    [
      "Chemical splash goggles",
      "Lab coat",
      "Chemically compatible gloves",
      flags.corrosive ? "Face shield or splash-rated facial protection for corrosive handling" : null,
      flags.toxic || flags.flammable ? "Use the reaction inside local exhaust ventilation or a fume hood" : null
    ].filter((item): item is string => Boolean(item))
  );

  const watchpoints = unique(
    [
      reaction.solvent ? `Solvent context: ${reaction.solvent}.` : null,
      reaction.temperature ? `Temperature context: ${reaction.temperature}.` : null,
      reaction.catalysts.length > 0 ? `Catalyst context: ${reaction.catalysts.join(", ")}.` : null,
      "This reaction safety layer combines participant hazards with modelled process notes and is not an official mixture SDS."
    ].filter((item): item is string => Boolean(item))
  );

  const sourceBacked = participants.filter((participant) => participant.status === "source-backed").length;

  return {
    status: sourceBacked > 0 ? "participant-derived" : "modelled-process",
    summary:
      sourceBacked > 0
        ? "Reaction safety is assembled from source-backed participant sheets plus process-level watchpoints."
        : "Reaction safety currently relies on participant summaries and modelled process watchpoints.",
    primaryHazards,
    controls,
    ppe,
    watchpoints,
    participants,
    participantCoverage: {
      sourceBacked,
      total: participants.length
    },
    note:
      "This view helps browse reaction risk context, but the current supplier SDS and process safety review remain the controlling references."
  };
}

function createSafeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function downloadMoleculeSafetySheetPdf(molecule: MoleculeRecord, safety: MoleculeSafetyRecord) {
  downloadPdfDocument({
    fileName: `${createSafeFileName(molecule.name)}-safety-sheet.pdf`,
    title: `${molecule.name} Safety Sheet`,
    subtitle:
      "Chemistry Engine safety summary. This PDF is an in-app reference summary and does not replace the current supplier SDS.",
    sections: [
      {
        heading: "Record overview",
        lines: [
          `Formula: ${molecule.formula}`,
          `IUPAC name: ${molecule.iupac}`,
          `PubChem CID: ${molecule.pubchemCid ?? "not linked"}`,
          `Safety source: ${safety.sourceLabel}`,
          `Summary: ${safety.summary}`,
          safety.signalWord ? `Signal word: ${safety.signalWord}` : "Signal word: not available",
          `Pictograms: ${safety.pictograms.length > 0 ? safety.pictograms.map((icon) => icon.label).join(", ") : "not available"}`
        ]
      },
      {
        heading: "Hazard statements",
        lines:
          safety.hazardStatements.length > 0
            ? safety.hazardStatements.map((statement) => `${statement.code}: ${statement.text}`)
            : ["No source-backed H statements were synced for this record."]
      },
      {
        heading: "Precautionary statements",
        lines:
          safety.precautionaryStatements.length > 0
            ? safety.precautionaryStatements.map((statement) => `${statement.code}: ${statement.text}`)
            : ["No source-backed P statements were synced for this record."]
      },
      {
        heading: "Physical properties",
        lines:
          safety.physicalProperties.length > 0
            ? safety.physicalProperties.map(
                (property) => `${property.label}: ${property.value}${property.source ? ` (${property.source})` : ""}`
              )
            : ["No physical properties available."]
      },
      {
        heading: "Handling notes",
        lines: safety.handlingNotes.length > 0 ? safety.handlingNotes : ["No handling notes available."]
      },
      {
        heading: "Sources",
        lines: [
          ...safety.sourceLinks.map((source) => `${source.label}: ${source.url}`),
          safety.note
        ].filter(isDefined)
      }
    ]
  });
}

export function downloadReactionSafetySheetPdf(
  reaction: ReactionRecord,
  molecules: MoleculeRecord[],
  safety: ReactionSafetyRecord,
  safetyRecords: Record<string, MoleculeSafetyRecord>
) {
  downloadPdfDocument({
    fileName: `${createSafeFileName(reaction.name)}-reaction-safety.pdf`,
    title: `${reaction.name} Reaction Safety Sheet`,
    subtitle:
      "Chemistry Engine reaction safety summary. This PDF combines participant hazard data with process watchpoints and does not replace formal process safety review or supplier SDS documents.",
    sections: [
      {
        heading: "Reaction overview",
        lines: [
          `Categories: ${reaction.categories.join(", ")}`,
          `Temperature: ${reaction.temperature ?? "not specified"}`,
          `Solvent: ${reaction.solvent ?? "not specified"}`,
          `Catalysts: ${reaction.catalysts.length > 0 ? reaction.catalysts.join(", ") : "none listed"}`,
          `Participant coverage: ${safety.participantCoverage.sourceBacked}/${safety.participantCoverage.total} source-backed participant sheets`,
          `Summary: ${safety.summary}`
        ]
      },
      {
        heading: "Primary hazards",
        lines: safety.primaryHazards.length > 0 ? safety.primaryHazards : ["No primary hazards derived yet."]
      },
      {
        heading: "Controls and PPE",
        lines: [
          ...safety.controls.map((item) => `Control: ${item}`),
          ...safety.ppe.map((item) => `PPE: ${item}`)
        ]
      },
      {
        heading: "Watchpoints",
        lines: safety.watchpoints
      },
      {
        heading: "Participant hazards",
        lines:
          molecules.length > 0
            ? molecules.flatMap((molecule) => {
                const record = safetyRecords[molecule.id];
                const header = `${molecule.name}: ${record?.signalWord ?? "No signal word"}${
                  record?.hazardStatements.length ? `; ${record.hazardStatements.slice(0, 2).map((item) => item.code).join(", ")}` : ""
                }`;
                const precautionary = record?.precautionaryStatements.slice(0, 2).map((item) => `${item.code}: ${item.text}`) ?? [];
                return [header, ...precautionary];
              })
            : ["No participant safety records available."]
      },
      {
        heading: "Sources",
        lines: [
          safety.note,
          ...molecules.flatMap((molecule) =>
            (safetyRecords[molecule.id]?.sourceLinks ?? []).slice(0, 3).map((source) => `${molecule.name} - ${source.label}: ${source.url}`)
          )
        ]
      }
    ]
  });
}
