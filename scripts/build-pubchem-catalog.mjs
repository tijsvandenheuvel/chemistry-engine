import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "src", "data", "molecules.seed.json");
const outputPath = path.join(rootDir, "src", "data", "molecules.catalog.json");

const propertyFields = [
  "Title",
  "IUPACName",
  "MolecularFormula",
  "MolecularWeight",
  "ConnectivitySMILES",
  "CanonicalSMILES",
  "XLogP",
  "TPSA",
  "HBondDonorCount",
  "HBondAcceptorCount",
  "ExactMass",
  "Complexity",
  "Charge"
].join(",");

const catalogBlueprint = [
  {
    categories: ["solvent", "organic", "process"],
    uses: ["Reaction medium", "Extraction", "Purification"],
    names: [
      "Water",
      "Methanol",
      "Ethanol",
      "1-Propanol",
      "2-Propanol",
      "1-Butanol",
      "2-Butanol",
      "tert-Butanol",
      "Acetone",
      "Acetonitrile",
      "Dimethyl Sulfoxide",
      "N,N-Dimethylformamide",
      "N-Methyl-2-pyrrolidone",
      "Tetrahydrofuran",
      "1,4-Dioxane",
      "Diethyl Ether",
      "Ethyl Acetate",
      "Methyl Acetate",
      "Butyl Acetate",
      "Propylene Carbonate",
      "Glycerol",
      "Formamide",
      "Hexane",
      "Heptane",
      "Cyclohexane",
      "Toluene",
      "Dichloromethane",
      "Chloroform"
    ]
  },
  {
    categories: ["organic", "aromatic", "reference"],
    uses: ["Aromatic chemistry", "Spectral assignment", "Structure browsing"],
    names: [
      "Benzene",
      "Phenol",
      "Aniline",
      "Anisole",
      "Nitrobenzene",
      "Benzaldehyde",
      "Benzoic Acid",
      "Benzyl Alcohol",
      "Acetophenone",
      "Benzophenone",
      "Biphenyl",
      "Naphthalene",
      "Anthracene",
      "Fluorobenzene",
      "Chlorobenzene",
      "Bromobenzene",
      "Iodobenzene",
      "Styrene",
      "Ethylbenzene",
      "Benzonitrile",
      "Salicylic Acid",
      "Vanillin",
      "Eugenol",
      "Thymol"
    ]
  },
  {
    categories: ["organic", "acid", "feedstock"],
    uses: ["Acid-base chemistry", "Catalysis context", "Process feedstock"],
    names: [
      "Formic Acid",
      "Acetic Acid",
      "Propionic Acid",
      "Butyric Acid",
      "Oxalic Acid",
      "Succinic Acid",
      "Malonic Acid",
      "Adipic Acid",
      "Lactic Acid",
      "Citric Acid",
      "Tartaric Acid",
      "Malic Acid",
      "Fumaric Acid",
      "Maleic Acid",
      "Trifluoroacetic Acid",
      "Acetic Anhydride",
      "Acetaldehyde",
      "Propanal",
      "Formaldehyde",
      "Cyclohexanone",
      "2-Butanone",
      "Camphor"
    ]
  },
  {
    categories: ["organic", "heterocycle", "reagent"],
    uses: ["Catalysis", "Medicinal chemistry reference", "Ligand and base screening"],
    names: [
      "Ammonia",
      "Methylamine",
      "Ethylamine",
      "Dimethylamine",
      "Diethylamine",
      "Triethylamine",
      "Ethanolamine",
      "Diethanolamine",
      "Triethanolamine",
      "Pyridine",
      "Piperidine",
      "Morpholine",
      "Imidazole",
      "Pyrazine",
      "Pyrimidine",
      "Pyrrole",
      "Indole",
      "Quinoline",
      "Isoquinoline",
      "Piperazine",
      "Caffeine",
      "Nicotine"
    ]
  },
  {
    categories: ["organic", "monomer", "feedstock"],
    uses: ["Polymer precursor", "Industrial synthesis", "Process screening"],
    names: [
      "Ethylene",
      "Propylene",
      "Acetylene",
      "Vinyl Chloride",
      "Acrylonitrile",
      "Methyl Methacrylate",
      "Acrylic Acid",
      "Acrolein",
      "Propylene Oxide",
      "Ethylene Oxide",
      "Caprolactam",
      "Adiponitrile",
      "Bisphenol A",
      "Epichlorohydrin",
      "Urea",
      "Ethylene Glycol",
      "Propylene Glycol",
      "Styrene"
    ]
  },
  {
    categories: ["organic", "sugar", "biochemistry"],
    uses: ["Carbohydrate chemistry", "Fermentation context", "Bio-based feedstock"],
    names: [
      "D-Glucose",
      "D-Fructose",
      "Sucrose",
      "Lactose",
      "Maltose",
      "D-Galactose",
      "D-Mannose",
      "D-Ribose",
      "2-Deoxy-D-ribose",
      "D-Xylose",
      "Sorbitol",
      "Mannitol",
      "Xylitol",
      "Glycerol",
      "Ethylene Glycol",
      "Propylene Glycol"
    ]
  },
  {
    categories: ["organic", "amino-acid", "biochemistry"],
    uses: ["Protein chemistry", "Metabolite reference", "Bioprocess design"],
    names: [
      "Glycine",
      "L-Alanine",
      "L-Valine",
      "L-Leucine",
      "L-Isoleucine",
      "L-Serine",
      "L-Threonine",
      "L-Cysteine",
      "L-Methionine",
      "L-Phenylalanine",
      "L-Tyrosine",
      "L-Tryptophan",
      "L-Aspartic acid",
      "L-Glutamic acid",
      "L-Lysine",
      "L-Arginine",
      "L-Histidine",
      "L-Proline",
      "L-Asparagine",
      "L-Glutamine"
    ]
  },
  {
    categories: ["organic", "nucleotide", "biochemistry"],
    uses: ["Genetic chemistry", "Nucleoside reference", "Biochemical pathway browsing"],
    names: [
      "Adenine",
      "Guanine",
      "Cytosine",
      "Thymine",
      "Uracil",
      "Adenosine",
      "Guanosine",
      "Cytidine",
      "Uridine",
      "Thymidine",
      "Riboflavin",
      "Niacin",
      "Nicotinamide",
      "Folic Acid",
      "Biotin",
      "Ascorbic Acid",
      "Retinol",
      "Melatonin"
    ]
  },
  {
    categories: ["organic", "pharma", "product"],
    uses: ["Drug reference", "Process route planning", "Medicinal chemistry comparison"],
    names: [
      "Aspirin",
      "Paracetamol",
      "Ibuprofen",
      "Naproxen",
      "Caffeine",
      "Theobromine",
      "Theophylline",
      "Metformin",
      "Lidocaine",
      "Procaine",
      "Benzocaine",
      "Dopamine",
      "Serotonin",
      "Histamine",
      "Diclofenac",
      "Warfarin",
      "Atropine",
      "Quinine",
      "Morphine",
      "Menthol"
    ]
  },
  {
    categories: ["organic", "natural-product", "reference"],
    uses: ["Natural product chemistry", "Flavor and fragrance reference", "Structure browsing"],
    names: [
      "Limonene",
      "Menthol",
      "Camphor",
      "Borneol",
      "Carvone",
      "Citral",
      "Geraniol",
      "Linalool",
      "Pinene",
      "Eucalyptol",
      "Vanillin",
      "Eugenol",
      "Coumarin",
      "Safrole",
      "Thymol",
      "Carvacrol",
      "Citronellal",
      "Citronellol",
      "Nerol",
      "Farnesol"
    ]
  },
  {
    categories: ["inorganic", "gas", "process"],
    uses: ["Gas handling", "Process chemistry", "Industrial reference"],
    names: [
      "Carbon Dioxide",
      "Carbon Monoxide",
      "Oxygen",
      "Nitrogen",
      "Nitric Oxide",
      "Nitrogen Dioxide",
      "Sulfur Dioxide",
      "Hydrogen Sulfide",
      "Hydrogen Peroxide",
      "Ozone",
      "Hydrochloric Acid",
      "Sulfuric Acid",
      "Nitric Acid",
      "Phosphoric Acid",
      "Sodium Chloride",
      "Potassium Chloride",
      "Sodium Hydroxide",
      "Potassium Hydroxide",
      "Sodium Carbonate",
      "Sodium Bicarbonate",
      "Potassium Carbonate",
      "Calcium Carbonate",
      "Ammonium Chloride",
      "Ammonium Nitrate"
    ]
  },
  {
    categories: ["organic", "halogenated", "process"],
    uses: ["Halogen chemistry", "Solvent selection", "Industrial reference"],
    names: [
      "Dichloromethane",
      "Chloroform",
      "Carbon Tetrachloride",
      "1,2-Dichloroethane",
      "Trichloroethylene",
      "Tetrachloroethylene",
      "1-Bromobutane",
      "1-Chlorobutane",
      "Chlorobenzene",
      "Bromobenzene",
      "Iodobenzene",
      "Fluorobenzene",
      "Trifluoroacetic Acid",
      "Hexafluorobenzene",
      "Bromoform",
      "Chloral Hydrate"
    ]
  }
];

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function numberOrUndefined(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseFormula(formula) {
  const counts = {};
  const matches = formula.matchAll(/([A-Z][a-z]?)(\d*)/g);

  for (const match of matches) {
    const [, element, countText] = match;
    counts[element] = (counts[element] ?? 0) + Number(countText || 1);
  }

  return counts;
}

function sumElements(counts, keys) {
  return keys.reduce((total, key) => total + (counts[key] ?? 0), 0);
}

function detectFeatures(smiles, formula, categories) {
  const counts = parseFormula(formula);
  const carbonCount = counts.C ?? 0;
  const hydrogenCount = counts.H ?? 0;
  const oxygenCount = counts.O ?? 0;
  const nitrogenCount = counts.N ?? 0;
  const sulfurCount = counts.S ?? 0;
  const phosphorusCount = counts.P ?? 0;
  const halogenCount = sumElements(counts, ["F", "Cl", "Br", "I"]);
  const aromatic = /c/.test(smiles);
  const carbonyl = /C\(=O\)|N\(=O\)|C=O/.test(smiles);
  const carboxylicAcid = /C\(=O\)O/.test(smiles);
  const ester = /OC\(=O\)|C\(=O\)O[Cc]/.test(smiles);
  const amide = /C\(=O\)N/.test(smiles);
  const amine = /N/.test(smiles) && !amide;
  const alcohol = /O/.test(smiles) && !carboxylicAcid && !ester && !amide;
  const nitrile = /#N/.test(smiles);
  const alkyne = /#/.test(smiles) && !nitrile;
  const alkene = /=/.test(smiles);

  return {
    counts,
    carbonCount,
    hydrogenCount,
    oxygenCount,
    nitrogenCount,
    sulfurCount,
    phosphorusCount,
    halogenCount,
    aromatic,
    carbonyl,
    carboxylicAcid,
    ester,
    amide,
    amine,
    alcohol,
    nitrile,
    alkyne,
    alkene,
    isInorganic: categories.includes("inorganic") || carbonCount === 0
  };
}

function dedupeStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function dedupeReferences(values) {
  const map = new Map();

  for (const value of values) {
    map.set(`${value.source}-${value.label}`, value);
  }

  return [...map.values()];
}

function buildDescription(name, categories, formula, sourceDatabase) {
  const readableCategories = categories.slice(0, 3).join(", ");
  return `${name} (${formula}) is in this catalog tagged as ${readableCategories}. Imported from ${sourceDatabase} for structure browsing, reaction planning and spectral previewing.`;
}

function deriveUses(categories) {
  const mappedUses = [];

  if (categories.includes("solvent")) {
    mappedUses.push("Reaction medium", "Extraction", "Purification");
  }
  if (categories.includes("feedstock")) {
    mappedUses.push("Process feedstock", "Scale-up screening");
  }
  if (categories.includes("aromatic")) {
    mappedUses.push("Spectral assignment", "Substitution chemistry");
  }
  if (categories.includes("heterocycle")) {
    mappedUses.push("Medicinal chemistry reference", "Ligand screening");
  }
  if (categories.includes("pharma")) {
    mappedUses.push("Drug reference", "Route planning");
  }
  if (categories.includes("biochemistry")) {
    mappedUses.push("Pathway reference", "Bioprocess context");
  }
  if (categories.includes("gas")) {
    mappedUses.push("Gas handling", "Emissions context");
  }
  if (categories.includes("monomer")) {
    mappedUses.push("Polymer precursor", "Process screening");
  }
  if (categories.includes("natural-product")) {
    mappedUses.push("Natural product reference", "Flavor and fragrance chemistry");
  }

  return dedupeStrings(mappedUses);
}

function deriveHazards(categories) {
  const hazardNotes = ["Consult the PubChem compound record for validated safety data before experimental use."];

  if (categories.includes("solvent")) {
    hazardNotes.push("Review flammability and ventilation requirements before scale-up.");
  }
  if (categories.includes("acid")) {
    hazardNotes.push("Acidic materials can be corrosive or strongly irritating depending on concentration.");
  }
  if (categories.includes("halogenated")) {
    hazardNotes.push("Halogenated compounds require careful toxicity and disposal review.");
  }
  if (categories.includes("gas")) {
    hazardNotes.push("Storage pressure, ventilation and exposure control dominate process safety.");
  }
  if (categories.includes("pharma")) {
    hazardNotes.push("Treat bioactive molecules as compounds requiring controlled handling.");
  }

  return dedupeStrings(hazardNotes).slice(0, 3);
}

function buildSpectralReferences(cid, name, categories, existingReferences = []) {
  const generated = [
    {
      kind: "Record",
      label: "PubChem compound record",
      source: "PubChem",
      url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
      availability: "open",
      notes: "Imported via PubChem PUG REST and used as the canonical compound identity."
    },
    {
      kind: "IR",
      label: "PubChem spectral information",
      source: "PubChem",
      url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}#section=Spectral-Information`,
      availability: "open",
      notes: "Primary external landing page for linked spectral annotations when available."
    }
  ];

  if (!categories.includes("inorganic")) {
    generated.push({
      kind: "1H NMR",
      label: "nmrshiftdb2 lookup",
      source: "nmrshiftdb2",
      url: "https://nmrshiftdb.nmr.uni-koeln.de/",
      availability: "open",
      notes: `${name} can be cross-checked against open NMR records and assignments.`
    });
  }

  generated.push({
    kind: "MS",
    label: "MassBank lookup",
    source: "MassBank",
    url: "https://massbank.eu/MassBank/",
    availability: "open",
    notes: "MassBank is a practical open source for tandem mass spectral follow-up."
  });

  return dedupeReferences([...existingReferences, ...generated]);
}

function addPeak(peaks, peak) {
  if (peak.position <= 0 || peak.intensity <= 0) {
    return;
  }

  peaks.push({
    width: peak.width ?? 24,
    ...peak
  });
}

function buildIrSpectrum(name, features) {
  const peaks = [];
  const summaryBits = [];

  if (features.carboxylicAcid) {
    addPeak(peaks, { position: 3000, intensity: 72, width: 220, label: "acid O-H" });
    addPeak(peaks, { position: 1712, intensity: 96, width: 45, label: "C=O" });
    summaryBits.push("carboxylic acid");
  } else if (features.alcohol) {
    addPeak(peaks, { position: 3340, intensity: 75, width: 180, label: "O-H" });
    summaryBits.push("alcohol");
  }

  if (features.carbonyl && !features.carboxylicAcid) {
    addPeak(peaks, { position: features.amide ? 1660 : 1718, intensity: 92, width: 42, label: "C=O" });
    summaryBits.push(features.amide ? "amide carbonyl" : "carbonyl");
  }

  if (features.amine) {
    addPeak(peaks, { position: 3310, intensity: 52, width: 95, label: "N-H" });
    summaryBits.push("amine");
  }

  if (features.aromatic) {
    addPeak(peaks, { position: 3030, intensity: 46, width: 40, label: "Ar C-H" });
    addPeak(peaks, { position: 1600, intensity: 55, width: 35, label: "Ar C=C" });
    addPeak(peaks, { position: 750, intensity: 40, width: 28, label: "oop bend" });
    summaryBits.push("aromatic");
  }

  if (features.alkene) {
    addPeak(peaks, { position: 1642, intensity: 45, width: 36, label: "C=C" });
  }

  if (features.alkyne) {
    addPeak(peaks, { position: 2120, intensity: 48, width: 28, label: "C≡C" });
  }

  if (features.nitrile) {
    addPeak(peaks, { position: 2245, intensity: 82, width: 24, label: "C≡N" });
    summaryBits.push("nitrile");
  }

  if (features.hydrogenCount > 0 && features.carbonCount > 0) {
    addPeak(peaks, { position: 2930, intensity: 40, width: 44, label: "C-H" });
  }

  if (features.oxygenCount > 0 && !features.carboxylicAcid) {
    addPeak(peaks, { position: 1110, intensity: 50, width: 32, label: "C-O" });
  }

  if (features.sulfurCount > 0) {
    addPeak(peaks, { position: 1045, intensity: 63, width: 32, label: "S=O" });
  }

  if (name.toLowerCase() === "carbon dioxide") {
    addPeak(peaks, { position: 2350, intensity: 96, width: 36, label: "CO2 asym." });
    addPeak(peaks, { position: 667, intensity: 72, width: 24, label: "CO2 bend" });
  }

  peaks.sort((left, right) => right.position - left.position);

  return {
    id: "predicted-ir",
    kind: "IR",
    mode: "predicted",
    title: "Predicted IR fingerprint",
    summary: summaryBits.length
      ? `Structure-derived IR preview highlighting ${summaryBits.join(", ")} features.`
      : "Structure-derived IR preview based on broad functional-group heuristics.",
    xLabel: "Wavenumber (cm⁻¹)",
    yLabel: "Relative absorbance",
    xMin: 4000,
    xMax: 500,
    reverseX: true,
    peaks
  };
}

function buildMassSpectrum(mass, features) {
  const peaks = [];
  const molecularIon = Math.max(1, Math.round(mass));

  addPeak(peaks, { position: molecularIon, intensity: 100, width: 2, label: "M⁺" });

  if (features.alcohol || features.carboxylicAcid) {
    addPeak(peaks, { position: molecularIon - 18, intensity: 46, width: 2, label: "M-18" });
  }
  if (features.carbonyl) {
    addPeak(peaks, { position: molecularIon - 28, intensity: 38, width: 2, label: "M-28" });
  }
  if (features.aromatic) {
    addPeak(peaks, { position: 77, intensity: 66, width: 2, label: "Ph⁺" });
    if (features.carbonCount >= 7) {
      addPeak(peaks, { position: 91, intensity: 54, width: 2, label: "benzyl" });
    }
  }
  if (features.ester || features.carboxylicAcid || features.carbonyl) {
    addPeak(peaks, { position: 43, intensity: 58, width: 2, label: "acyl" });
  }
  if (features.alcohol) {
    addPeak(peaks, { position: 31, intensity: 52, width: 2, label: "O-frag" });
  }
  if (features.amine) {
    addPeak(peaks, { position: 30, intensity: 42, width: 2, label: "amine" });
  }
  if (features.halogenCount > 0) {
    addPeak(peaks, { position: molecularIon + 2, intensity: 28, width: 2, label: "M+2" });
  }
  if (features.isInorganic && molecularIon < 120) {
    addPeak(peaks, { position: Math.max(1, Math.round(molecularIon / 2)), intensity: 35, width: 2, label: "frag" });
  }

  peaks.sort((left, right) => left.position - right.position);

  return {
    id: "predicted-ms",
    kind: "MS",
    mode: "predicted",
    title: "Predicted mass spectrum",
    summary: "Structure-derived mass spectral sketch using molecular-ion and common fragment heuristics.",
    xLabel: "m/z",
    yLabel: "Relative intensity",
    xMin: 0,
    xMax: Math.max(150, molecularIon + 20),
    peaks
  };
}

function buildUvSpectrum(features) {
  const peaks = [];

  if (features.aromatic) {
    addPeak(peaks, { position: 205, intensity: 65, width: 12, label: "π→π*" });
    addPeak(peaks, { position: features.carbonyl ? 278 : 254, intensity: 82, width: 16, label: "aromatic band" });
    if (features.carbonyl) {
      addPeak(peaks, { position: 312, intensity: 42, width: 18, label: "n→π*" });
    }
  } else if (features.alkene || features.carbonyl) {
    addPeak(peaks, { position: 198, intensity: 58, width: 12, label: "π→π*" });
    addPeak(peaks, { position: 235, intensity: 48, width: 14, label: "n→π*" });
  } else {
    addPeak(peaks, { position: 190, intensity: 36, width: 12, label: "far UV" });
  }

  return {
    id: "predicted-uv",
    kind: "UV/Vis",
    mode: "predicted",
    title: "Predicted UV/Vis profile",
    summary: "Approximate UV/Vis bands based on conjugation, aromaticity and heteroatom-driven transitions.",
    xLabel: "Wavelength (nm)",
    yLabel: "Relative absorbance",
    xMin: 180,
    xMax: 420,
    peaks
  };
}

function buildNmrSpectrum(features) {
  if (features.isInorganic || features.hydrogenCount === 0 || features.carbonCount === 0) {
    return null;
  }

  const peaks = [];
  addPeak(peaks, { position: 1.2, intensity: Math.min(85, features.hydrogenCount * 4), width: 0.25, label: "alkyl H" });

  if (features.alcohol || features.amine) {
    addPeak(peaks, { position: features.alcohol ? 3.6 : 2.8, intensity: 42, width: 0.3, label: features.alcohol ? "O-CH / OH" : "N-CH / NH" });
  }
  if (features.aromatic) {
    addPeak(peaks, { position: 7.2, intensity: Math.min(92, features.carbonCount * 5), width: 0.35, label: "Ar-H" });
  }
  if (features.alkene) {
    addPeak(peaks, { position: 5.7, intensity: 36, width: 0.25, label: "vinyl H" });
  }
  if (features.carboxylicAcid) {
    addPeak(peaks, { position: 11.3, intensity: 24, width: 0.28, label: "acid H" });
  }

  peaks.sort((left, right) => right.position - left.position);

  return {
    id: "predicted-h1",
    kind: "1H NMR",
    mode: "predicted",
    title: "Predicted 1H NMR envelope",
    summary: "Sketch-level proton NMR preview generated from functional-group and aromaticity heuristics.",
    xLabel: "Chemical shift (ppm)",
    yLabel: "Relative intensity",
    xMin: 12,
    xMax: 0,
    reverseX: true,
    peaks
  };
}

function buildSpectra(record) {
  const features = detectFeatures(record.smiles, record.formula, record.categories);
  const spectra = [
    buildIrSpectrum(record.name, features),
    buildMassSpectrum(record.exactMass ?? record.molecularWeight, features),
    buildUvSpectrum(features),
    buildNmrSpectrum(features)
  ].filter(Boolean);

  return spectra;
}

async function fetchJson(url, attempt = 0) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "chemie-engine-catalog/0.1"
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
      return fetchJson(url, attempt + 1);
    }

    throw error;
  }
}

async function mapConcurrent(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const currentIndex = cursor++;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    })
  );

  return results;
}

function createRequestRegistry() {
  const registry = new Map();

  for (const group of catalogBlueprint) {
    for (const name of group.names) {
      const key = normalizeName(name);
      const existing = registry.get(key) ?? {
        query: name,
        categories: new Set(),
        uses: new Set()
      };

      group.categories.forEach((category) => existing.categories.add(category));
      group.uses.forEach((useCase) => existing.uses.add(useCase));
      registry.set(key, existing);
    }
  }

  return [...registry.values()];
}

async function loadSeeds() {
  const raw = await readFile(seedPath, "utf8");
  return JSON.parse(raw);
}

function createSeedMaps(seeds) {
  const byCid = new Map();
  const byName = new Map();

  for (const seed of seeds) {
    if (seed.pubchemCid) {
      byCid.set(seed.pubchemCid, seed);
    }

    byName.set(normalizeName(seed.name), seed);
    byName.set(normalizeName(seed.iupac), seed);
  }

  return { byCid, byName };
}

async function fetchPropertyBundle(request) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(request.query)}/property/${propertyFields}/JSON`;
  const json = await fetchJson(url);
  const property = json?.PropertyTable?.Properties?.[0];

  if (!property) {
    throw new Error(`No PubChem property record for ${request.query}`);
  }

  return property;
}

function buildRecord(request, property, seedMaps) {
  const cid = Number(property.CID);
  const matchedSeed = seedMaps.byCid.get(cid) ?? seedMaps.byName.get(normalizeName(property.Title ?? request.query));
  const name = property.Title ?? matchedSeed?.name ?? request.query;
  const formula = property.MolecularFormula ?? matchedSeed?.formula ?? "";
  const smiles = property.ConnectivitySMILES ?? property.CanonicalSMILES ?? matchedSeed?.smiles ?? "";
  const categories = dedupeStrings([
    ...(matchedSeed?.categories ?? []),
    ...request.categories,
    ...(smiles.includes("c") ? ["aromatic"] : []),
    ...(sumElements(parseFormula(formula), ["F", "Cl", "Br", "I"]) > 0 ? ["halogenated"] : [])
  ]);
  const uses = dedupeStrings([
    ...(matchedSeed?.uses ?? []),
    ...request.uses,
    ...deriveUses(categories)
  ]);
  const hazardNotes = dedupeStrings([...(matchedSeed?.hazardNotes ?? []), ...deriveHazards(categories)]);
  const record = {
    id: matchedSeed?.id ?? slugify(name),
    name,
    iupac: property.IUPACName ?? matchedSeed?.iupac ?? name.toLowerCase(),
    formula,
    pubchemCid: cid,
    smiles,
    description: matchedSeed?.description ?? buildDescription(name, categories, formula, "PubChem"),
    categories,
    uses,
    hazardNotes,
    molecularWeight: numberOrUndefined(property.MolecularWeight) ?? matchedSeed?.molecularWeight ?? 0,
    xlogp: numberOrUndefined(property.XLogP) ?? matchedSeed?.xlogp,
    tpsa: numberOrUndefined(property.TPSA) ?? matchedSeed?.tpsa,
    hBondDonors: numberOrUndefined(property.HBondDonorCount) ?? matchedSeed?.hBondDonors,
    hBondAcceptors: numberOrUndefined(property.HBondAcceptorCount) ?? matchedSeed?.hBondAcceptors,
    exactMass: numberOrUndefined(property.ExactMass),
    complexity: numberOrUndefined(property.Complexity),
    charge: numberOrUndefined(property.Charge),
    sourceDatabase: "PubChem",
    spectralReferences: buildSpectralReferences(cid, name, categories, matchedSeed?.spectralReferences ?? [])
  };

  return {
    ...record,
    spectra: buildSpectra(record)
  };
}

async function main() {
  const seeds = await loadSeeds();
  const requests = createRequestRegistry();
  const seedMaps = createSeedMaps(seeds);
  const failures = [];

  const records = await mapConcurrent(requests, 10, async (request) => {
    try {
      const property = await fetchPropertyBundle(request);
      return buildRecord(request, property, seedMaps);
    } catch (error) {
      failures.push({
        query: request.query,
        message: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  });

  const catalog = records
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name));

  await writeFile(outputPath, JSON.stringify(catalog, null, 2), "utf8");

  console.log(`saved ${catalog.length} molecules to ${outputPath}`);

  if (failures.length > 0) {
    console.log(`failed to resolve ${failures.length} names`);
    console.log(JSON.stringify(failures.slice(0, 20), null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
