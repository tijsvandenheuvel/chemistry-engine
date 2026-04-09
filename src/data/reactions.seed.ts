import moleculeCatalog from "./molecules.catalog.json";
import type { ReactionRecord, ReactionStep } from "../types/chemistry";

type ReactionBlueprint = {
  id: string;
  name: string;
  categories: string[];
  summary: string;
  reactants: string[];
  products: string[];
  catalysts?: string[];
  solvent?: string;
  temperature?: string;
  notes: string;
  focusSequence?: string[];
};

type SimplePair = {
  id: string;
  reactant: string;
};

type RoutePair = {
  id: string;
  name: string;
  reactants: string[];
  products: string[];
  categories: string[];
  summary: string;
  catalysts?: string[];
  solvent?: string;
  temperature?: string;
  notes: string;
  focusSequence?: string[];
};

const moleculeNameById = new Map(
  (moleculeCatalog as Array<{ id: string; name: string }>).map((molecule) => [molecule.id, molecule.name])
);

function nameOf(moleculeId: string) {
  const name = moleculeNameById.get(moleculeId);
  if (!name) {
    throw new Error(`Unknown molecule id in reaction seed: ${moleculeId}`);
  }

  return name;
}

function listNames(ids: string[]) {
  if (ids.length === 0) {
    return "no species";
  }

  if (ids.length === 1) {
    return nameOf(ids[0]);
  }

  if (ids.length === 2) {
    return `${nameOf(ids[0])} and ${nameOf(ids[1])}`;
  }

  return `${ids.slice(0, -1).map(nameOf).join(", ")} and ${nameOf(ids[ids.length - 1])}`;
}

function createSteps(blueprint: ReactionBlueprint): ReactionStep[] {
  const primaryReactant = blueprint.focusSequence?.[0] ?? blueprint.reactants[0];
  const secondaryReactant =
    blueprint.focusSequence?.[1] ?? blueprint.reactants[1] ?? blueprint.reactants[0] ?? blueprint.products[0];
  const primaryProduct = blueprint.focusSequence?.[2] ?? blueprint.products[0];
  const finalProduct =
    blueprint.focusSequence?.[3] ?? blueprint.products[blueprint.products.length - 1] ?? blueprint.products[0];
  const activationLine =
    blueprint.catalysts && blueprint.catalysts.length > 0
      ? `Catalysts or activation conditions tighten the encounter zone and bias the modeled pathway toward ${listNames(blueprint.products)}.`
      : `The reaction stage compresses the participants so atoms and functional groups can be shown converging inside the modeled transition zone.`;

  return [
    {
      title: "Stage Reactants",
      description: `${listNames(blueprint.reactants)} are separated into incoming 3D lanes before the modeled encounter begins.`,
      focusMoleculeId: primaryReactant
    },
    {
      title: "Compress Encounter",
      description: activationLine,
      focusMoleculeId: secondaryReactant
    },
    {
      title: "Reorganize Atoms",
      description: `The viewer models atoms and fragments as converging, exchanging or splitting while the system transitions toward ${listNames(blueprint.products)}.`,
      focusMoleculeId: primaryProduct
    },
    {
      title: "Release Products",
      description: `${listNames(blueprint.products)} separate into outgoing 3D lanes so the product side of the reaction can be compared against the starting mixture.`,
      focusMoleculeId: finalProduct
    }
  ];
}

function createReaction(blueprint: ReactionBlueprint): ReactionRecord {
  return {
    id: blueprint.id,
    name: blueprint.name,
    categories: blueprint.categories,
    summary: blueprint.summary,
    reactants: blueprint.reactants,
    products: blueprint.products,
    catalysts: blueprint.catalysts ?? [],
    solvent: blueprint.solvent,
    temperature: blueprint.temperature,
    notes: `${blueprint.notes} This animation is presented as a modelled structural transition unless exact atom mapping is added later.`,
    steps: createSteps(blueprint)
  };
}

const combustionPairs: SimplePair[] = [
  { id: "methanol", reactant: "methanol" },
  { id: "ethanol", reactant: "ethanol" },
  { id: "1-propanol", reactant: "1-propanol" },
  { id: "1-butanol", reactant: "1-butanol" },
  { id: "isopropanol", reactant: "isopropanol" },
  { id: "tert-butanol", reactant: "tert-butanol" },
  { id: "acetone", reactant: "acetone" },
  { id: "acetaldehyde", reactant: "acetaldehyde" },
  { id: "acetic-acid", reactant: "acetic-acid" },
  { id: "ethyl-acetate", reactant: "ethyl-acetate" },
  { id: "methyl-acetate", reactant: "methyl-acetate" },
  { id: "butyl-acetate", reactant: "butyl-acetate" },
  { id: "benzene", reactant: "benzene" },
  { id: "toluene", reactant: "toluene" },
  { id: "ethylbenzene", reactant: "ethylbenzene" },
  { id: "styrene", reactant: "styrene" },
  { id: "phenol", reactant: "phenol" },
  { id: "aniline", reactant: "aniline" },
  { id: "acetylene", reactant: "acetylene" },
  { id: "ethylene", reactant: "ethylene" },
  { id: "propylene", reactant: "propylene" },
  { id: "acetonitrile", reactant: "acetonitrile" },
  { id: "diethyl-ether", reactant: "diethyl-ether" },
  { id: "tetrahydrofuran", reactant: "tetrahydrofuran" },
  { id: "glycerol", reactant: "glycerol" },
  { id: "lactic-acid", reactant: "lactic-acid" },
  { id: "acrylic-acid", reactant: "acrylic-acid" },
  { id: "propionic-acid", reactant: "propionic-acid" },
  { id: "butyric-acid", reactant: "butyric-acid" },
  { id: "benzaldehyde", reactant: "benzaldehyde" },
  { id: "benzyl-alcohol", reactant: "benzyl-alcohol" },
  { id: "benzoic-acid", reactant: "benzoic-acid" },
  { id: "acrylonitrile", reactant: "acrylonitrile" },
  { id: "caprolactam", reactant: "caprolactam" },
  { id: "adipic-acid", reactant: "adipic-acid" }
];

const hydrationRoutes: RoutePair[] = [
  {
    id: "ethylene-hydration",
    name: "Ethylene Hydration",
    reactants: ["ethylene", "water"],
    products: ["ethanol"],
    categories: ["hydration", "addition", "feedstock", "simple"],
    summary: "Hydration of ethylene to ethanol under acid-catalyzed process conditions.",
    catalysts: ["acid catalyst"],
    solvent: "Aqueous phase",
    temperature: "Elevated pressure and heat",
    notes: "Useful baseline addition reaction showing a simple two-to-one modeled assembly."
  },
  {
    id: "propylene-hydration",
    name: "Propylene Hydration",
    reactants: ["propylene", "water"],
    products: ["isopropanol"],
    categories: ["hydration", "addition", "feedstock", "simple"],
    summary: "Hydration of propylene to isopropanol.",
    catalysts: ["acid catalyst"],
    solvent: "Aqueous phase",
    temperature: "Process heat",
    notes: "Models feedstock hydration into a single alcohol product."
  },
  {
    id: "acetylene-hydration",
    name: "Acetylene Hydration",
    reactants: ["acetylene", "water"],
    products: ["acetaldehyde"],
    categories: ["hydration", "addition", "carbonyl", "simple"],
    summary: "Hydration of acetylene toward acetaldehyde under catalytic conditions.",
    catalysts: ["mercury or acid catalyst"],
    solvent: "Aqueous phase",
    temperature: "Warm",
    notes: "Captures a simple alkyne-to-carbonyl transformation."
  },
  {
    id: "ethylene-oxide-hydration",
    name: "Ethylene Oxide Hydration",
    reactants: ["ethylene-oxide", "water"],
    products: ["ethylene-glycol"],
    categories: ["hydration", "ring-opening", "glycol", "simple"],
    summary: "Ring-opening hydration of ethylene oxide to ethylene glycol.",
    solvent: "Water-rich phase",
    temperature: "Moderate",
    notes: "Shows a compact ring-opening process with one major glycol product."
  },
  {
    id: "propylene-oxide-hydration",
    name: "Propylene Oxide Hydration",
    reactants: ["propylene-oxide", "water"],
    products: ["propylene-glycol"],
    categories: ["hydration", "ring-opening", "glycol", "simple"],
    summary: "Ring-opening hydration of propylene oxide to propylene glycol.",
    solvent: "Water-rich phase",
    temperature: "Moderate",
    notes: "Another straightforward epoxide opening route suitable for 3D assembly playback."
  },
  {
    id: "ethanol-dehydration",
    name: "Ethanol Dehydration",
    reactants: ["ethanol"],
    products: ["ethylene", "water"],
    categories: ["dehydration", "elimination", "alkene", "simple"],
    summary: "Dehydration of ethanol to ethylene and water.",
    catalysts: ["acid catalyst"],
    temperature: "Heated",
    notes: "Useful reverse of hydration where the product side splits into an alkene and water."
  },
  {
    id: "isopropanol-dehydration",
    name: "Isopropanol Dehydration",
    reactants: ["isopropanol"],
    products: ["propylene", "water"],
    categories: ["dehydration", "elimination", "alkene", "simple"],
    summary: "Dehydration of isopropanol to propylene and water.",
    catalysts: ["acid catalyst"],
    temperature: "Heated",
    notes: "A simple single-to-two product split for the reaction viewer."
  },
  {
    id: "propanol-dehydration",
    name: "1-Propanol Dehydration",
    reactants: ["1-propanol"],
    products: ["propylene", "water"],
    categories: ["dehydration", "elimination", "alkene", "simple"],
    summary: "Dehydration of 1-propanol to propylene and water.",
    catalysts: ["acid catalyst"],
    temperature: "Heated",
    notes: "Models an alcohol elimination with a clear product split."
  },
  {
    id: "ethylene-glycol-cyclization",
    name: "Ethylene Glycol Cyclization",
    reactants: ["ethylene-glycol"],
    products: ["ethylene-oxide", "water"],
    categories: ["cyclization", "dehydration", "epoxide", "simple"],
    summary: "Modelled cyclization of ethylene glycol toward ethylene oxide.",
    temperature: "Heated",
    notes: "Useful as the reverse direction of ethylene oxide hydration."
  },
  {
    id: "propylene-glycol-cyclization",
    name: "Propylene Glycol Cyclization",
    reactants: ["propylene-glycol"],
    products: ["propylene-oxide", "water"],
    categories: ["cyclization", "dehydration", "epoxide", "simple"],
    summary: "Modelled cyclization of propylene glycol toward propylene oxide.",
    temperature: "Heated",
    notes: "Keeps the ring-opening family symmetrical for browsing."
  },
  {
    id: "glycerol-dehydration",
    name: "Glycerol Dehydration",
    reactants: ["glycerol"],
    products: ["acrolein", "water"],
    categories: ["dehydration", "feedstock", "carbonyl", "simple"],
    summary: "Dehydration of glycerol toward acrolein and water.",
    catalysts: ["acid catalyst"],
    temperature: "Heated",
    notes: "A feedstock dehydration route with a clean split into smaller products."
  },
  {
    id: "propylene-carbonate-hydrolysis",
    name: "Propylene Carbonate Hydrolysis",
    reactants: ["propylene-carbonate", "water"],
    products: ["propylene-glycol", "carbon-dioxide"],
    categories: ["hydrolysis", "ring-opening", "carbonate", "simple"],
    summary: "Hydrolysis of propylene carbonate toward propylene glycol and carbon dioxide.",
    temperature: "Warm aqueous conditions",
    notes: "Adds a simple carbonate-opening route with gas release."
  },
  {
    id: "acetic-anhydride-hydrolysis",
    name: "Acetic Anhydride Hydrolysis",
    reactants: ["acetic-anhydride", "water"],
    products: ["acetic-acid"],
    categories: ["hydrolysis", "acylation", "simple"],
    summary: "Hydrolysis of acetic anhydride back to acetic-acid-rich material.",
    solvent: "Water",
    temperature: "Ambient to warm",
    notes: "A simple quench route useful for modeled reagent breakdown."
  },
  {
    id: "methyl-acetate-hydrolysis",
    name: "Methyl Acetate Hydrolysis",
    reactants: ["methyl-acetate", "water"],
    products: ["methanol", "acetic-acid"],
    categories: ["hydrolysis", "ester", "simple"],
    summary: "Hydrolysis of methyl acetate to methanol and acetic acid.",
    catalysts: ["acid or base catalyst"],
    solvent: "Water",
    temperature: "Warm",
    notes: "A compact ester cleavage route."
  },
  {
    id: "ethyl-acetate-hydrolysis",
    name: "Ethyl Acetate Hydrolysis",
    reactants: ["ethyl-acetate", "water"],
    products: ["ethanol", "acetic-acid"],
    categories: ["hydrolysis", "ester", "simple"],
    summary: "Hydrolysis of ethyl acetate to ethanol and acetic acid.",
    catalysts: ["acid or base catalyst"],
    solvent: "Water",
    temperature: "Warm",
    notes: "Reverse of the Fischer esterification route."
  },
  {
    id: "butyl-acetate-hydrolysis",
    name: "Butyl Acetate Hydrolysis",
    reactants: ["butyl-acetate", "water"],
    products: ["1-butanol", "acetic-acid"],
    categories: ["hydrolysis", "ester", "simple"],
    summary: "Hydrolysis of butyl acetate to 1-butanol and acetic acid.",
    catalysts: ["acid or base catalyst"],
    solvent: "Water",
    temperature: "Warm",
    notes: "Extends the acetate family with a longer-chain alcohol release."
  },
  {
    id: "aspirin-hydrolysis",
    name: "Aspirin Hydrolysis",
    reactants: ["aspirin", "water"],
    products: ["salicylic-acid", "acetic-acid"],
    categories: ["hydrolysis", "pharma", "deprotection", "simple"],
    summary: "Hydrolysis of aspirin toward salicylic acid and acetic acid.",
    temperature: "Warm aqueous conditions",
    notes: "Useful pharma-side reverse transformation."
  },
  {
    id: "ethylene-oxide-ammonolysis",
    name: "Ethylene Oxide Ammonolysis",
    reactants: ["ethylene-oxide", "ammonia"],
    products: ["ethanolamine"],
    categories: ["ring-opening", "amination", "simple"],
    summary: "Opening of ethylene oxide with ammonia to form ethanolamine.",
    solvent: "Reactive mixture",
    temperature: "Moderate",
    notes: "Provides a simple one-product amination route."
  },
  {
    id: "ethanolamine-hydroxyethylation",
    name: "Ethanolamine Hydroxyethylation",
    reactants: ["ethanolamine", "ethylene-oxide"],
    products: ["diethanolamine"],
    categories: ["ring-opening", "amination", "process", "simple"],
    summary: "Hydroxyethylation of ethanolamine with ethylene oxide to diethanolamine.",
    solvent: "Reactive mixture",
    temperature: "Moderate",
    notes: "A clean step-up amination route for the viewer."
  },
  {
    id: "diethanolamine-hydroxyethylation",
    name: "Diethanolamine Hydroxyethylation",
    reactants: ["diethanolamine", "ethylene-oxide"],
    products: ["triethanolamine"],
    categories: ["ring-opening", "amination", "process", "simple"],
    summary: "Hydroxyethylation of diethanolamine with ethylene oxide to triethanolamine.",
    solvent: "Reactive mixture",
    temperature: "Moderate",
    notes: "Completes the ethanolamine ladder with another simple epoxide-opening step."
  }
];

const esterRoutes: RoutePair[] = [
  {
    id: "methyl-acetate-esterification",
    name: "Methyl Acetate Esterification",
    reactants: ["acetic-acid", "methanol"],
    products: ["methyl-acetate", "water"],
    categories: ["esterification", "synthesis", "equilibrium", "simple"],
    summary: "Fischer esterification of acetic acid and methanol into methyl acetate.",
    catalysts: ["acid catalyst"],
    solvent: "Reactive mixture",
    temperature: "Reflux",
    notes: "Simple two-to-two assembly route around the acetate family."
  },
  {
    id: "ethyl-acetate-esterification",
    name: "Ethyl Acetate Esterification",
    reactants: ["acetic-acid", "ethanol"],
    products: ["ethyl-acetate", "water"],
    categories: ["esterification", "synthesis", "equilibrium", "simple"],
    summary: "Fischer esterification of acetic acid and ethanol into ethyl acetate.",
    catalysts: ["sulfuric acid"],
    solvent: "Reactive mixture",
    temperature: "Reflux",
    notes: "A solvent-side benchmark transformation."
  },
  {
    id: "butyl-acetate-esterification",
    name: "Butyl Acetate Esterification",
    reactants: ["acetic-acid", "1-butanol"],
    products: ["butyl-acetate", "water"],
    categories: ["esterification", "synthesis", "solvent", "simple"],
    summary: "Esterification of acetic acid and 1-butanol to butyl acetate.",
    catalysts: ["acid catalyst"],
    solvent: "Reactive mixture",
    temperature: "Reflux",
    notes: "Adds a longer-chain acetate route with a bulky alcohol."
  },
  {
    id: "methyl-acetate-acylation",
    name: "Methyl Acetate Acylation",
    reactants: ["acetic-anhydride", "methanol"],
    products: ["methyl-acetate", "acetic-acid"],
    categories: ["acylation", "esterification", "simple"],
    summary: "Acyl transfer from acetic anhydride to methanol giving methyl acetate and acetic acid.",
    catalysts: ["acid catalyst"],
    temperature: "Warm",
    notes: "A direct acylation route into the same ester family."
  },
  {
    id: "ethyl-acetate-acylation",
    name: "Ethyl Acetate Acylation",
    reactants: ["acetic-anhydride", "ethanol"],
    products: ["ethyl-acetate", "acetic-acid"],
    categories: ["acylation", "esterification", "simple"],
    summary: "Acyl transfer from acetic anhydride to ethanol giving ethyl acetate.",
    catalysts: ["acid catalyst"],
    temperature: "Warm",
    notes: "A compact acylation route suitable for modeled bond-rearrangement playback."
  },
  {
    id: "butyl-acetate-acylation",
    name: "Butyl Acetate Acylation",
    reactants: ["acetic-anhydride", "1-butanol"],
    products: ["butyl-acetate", "acetic-acid"],
    categories: ["acylation", "esterification", "simple"],
    summary: "Acyl transfer from acetic anhydride to 1-butanol giving butyl acetate.",
    catalysts: ["acid catalyst"],
    temperature: "Warm",
    notes: "Keeps the acetate family broad for the reaction browser."
  },
  {
    id: "aspirin-synthesis",
    name: "Aspirin Synthesis",
    reactants: ["salicylic-acid", "acetic-anhydride"],
    products: ["aspirin", "acetic-acid"],
    categories: ["synthesis", "acetylation", "pharma", "simple"],
    summary: "Acetylation of salicylic acid with acetic anhydride to produce aspirin.",
    catalysts: ["acid catalyst"],
    solvent: "Acetic-acid-rich mixture",
    temperature: "Warm then crystallization",
    notes: "Classic acetylation route that benefits from a clear modeled 3D assembly pass."
  },
  {
    id: "methyl-to-ethyl-acetate-transesterification",
    name: "Methyl To Ethyl Acetate Transesterification",
    reactants: ["methyl-acetate", "ethanol"],
    products: ["ethyl-acetate", "methanol"],
    categories: ["transesterification", "equilibrium", "simple"],
    summary: "Exchange of alcohol fragments between methyl acetate and ethanol.",
    catalysts: ["acid or base catalyst"],
    solvent: "Reactive mixture",
    temperature: "Warm",
    notes: "Shows fragment exchange between an ester and an alcohol."
  },
  {
    id: "ethyl-to-methyl-acetate-transesterification",
    name: "Ethyl To Methyl Acetate Transesterification",
    reactants: ["ethyl-acetate", "methanol"],
    products: ["methyl-acetate", "ethanol"],
    categories: ["transesterification", "equilibrium", "simple"],
    summary: "Exchange of alcohol fragments between ethyl acetate and methanol.",
    catalysts: ["acid or base catalyst"],
    solvent: "Reactive mixture",
    temperature: "Warm",
    notes: "Reverse direction of the methyl/ethyl exchange pair."
  },
  {
    id: "methyl-to-butyl-acetate-transesterification",
    name: "Methyl To Butyl Acetate Transesterification",
    reactants: ["methyl-acetate", "1-butanol"],
    products: ["butyl-acetate", "methanol"],
    categories: ["transesterification", "equilibrium", "simple"],
    summary: "Exchange of alcohol fragments between methyl acetate and 1-butanol.",
    catalysts: ["acid or base catalyst"],
    solvent: "Reactive mixture",
    temperature: "Warm",
    notes: "Adds a heavier alcohol branch to the transesterification family."
  },
  {
    id: "butyl-to-ethyl-acetate-transesterification",
    name: "Butyl To Ethyl Acetate Transesterification",
    reactants: ["butyl-acetate", "ethanol"],
    products: ["ethyl-acetate", "1-butanol"],
    categories: ["transesterification", "equilibrium", "simple"],
    summary: "Exchange of alcohol fragments between butyl acetate and ethanol.",
    catalysts: ["acid or base catalyst"],
    solvent: "Reactive mixture",
    temperature: "Warm",
    notes: "Completes a practical acetate-exchange network for the viewer."
  }
];

const oxidationRoutes: RoutePair[] = [
  {
    id: "methanol-partial-oxidation",
    name: "Methanol Partial Oxidation",
    reactants: ["methanol", "oxygen"],
    products: ["formaldehyde", "water"],
    categories: ["oxidation", "feedstock", "simple"],
    summary: "Partial oxidation of methanol to formaldehyde.",
    catalysts: ["silver or oxide catalyst"],
    temperature: "Hot",
    notes: "Simple oxygen-driven oxidation with one oxygenated product."
  },
  {
    id: "formaldehyde-oxidation",
    name: "Formaldehyde Oxidation",
    reactants: ["formaldehyde", "oxygen"],
    products: ["formic-acid"],
    categories: ["oxidation", "aldehyde", "simple"],
    summary: "Oxidation of formaldehyde toward formic acid.",
    temperature: "Mild oxidative conditions",
    notes: "Represents a short aldehyde-to-acid oxidation step."
  },
  {
    id: "ethanol-oxidation",
    name: "Ethanol Oxidation",
    reactants: ["ethanol", "oxygen"],
    products: ["acetaldehyde", "water"],
    categories: ["oxidation", "alcohol", "simple"],
    summary: "Oxidation of ethanol to acetaldehyde.",
    catalysts: ["oxidation catalyst"],
    temperature: "Warm",
    notes: "A simple alcohol-to-aldehyde conversion."
  },
  {
    id: "acetaldehyde-oxidation",
    name: "Acetaldehyde Oxidation",
    reactants: ["acetaldehyde", "oxygen"],
    products: ["acetic-acid"],
    categories: ["oxidation", "aldehyde", "simple"],
    summary: "Oxidation of acetaldehyde to acetic acid.",
    temperature: "Mild oxidative conditions",
    notes: "Extends the ethanol oxidation chain into the acid product."
  },
  {
    id: "propanol-oxidation",
    name: "1-Propanol Oxidation",
    reactants: ["1-propanol", "oxygen"],
    products: ["propanal", "water"],
    categories: ["oxidation", "alcohol", "simple"],
    summary: "Oxidation of 1-propanol to propanal.",
    catalysts: ["oxidation catalyst"],
    temperature: "Warm",
    notes: "A straightforward primary-alcohol oxidation."
  },
  {
    id: "propanal-oxidation",
    name: "Propanal Oxidation",
    reactants: ["propanal", "oxygen"],
    products: ["propionic-acid"],
    categories: ["oxidation", "aldehyde", "simple"],
    summary: "Oxidation of propanal to propionic acid.",
    temperature: "Mild oxidative conditions",
    notes: "Useful to animate a clean aldehyde-to-acid progression."
  },
  {
    id: "isopropanol-oxidation",
    name: "Isopropanol Oxidation",
    reactants: ["isopropanol", "oxygen"],
    products: ["acetone", "water"],
    categories: ["oxidation", "alcohol", "ketone", "simple"],
    summary: "Oxidation of isopropanol to acetone.",
    catalysts: ["oxidation catalyst"],
    temperature: "Warm",
    notes: "A secondary-alcohol oxidation route with a ketone product."
  },
  {
    id: "butanol-oxidation",
    name: "1-Butanol Oxidation",
    reactants: ["1-butanol", "oxygen"],
    products: ["butyric-acid", "water"],
    categories: ["oxidation", "alcohol", "acid", "simple"],
    summary: "Modelled oxidation of 1-butanol toward butyric acid.",
    temperature: "Oxidative conditions",
    notes: "Presented as a simple feedstock oxidation route rather than a detailed mechanism."
  },
  {
    id: "benzyl-alcohol-oxidation",
    name: "Benzyl Alcohol Oxidation",
    reactants: ["benzyl-alcohol", "oxygen"],
    products: ["benzaldehyde", "water"],
    categories: ["oxidation", "aromatic", "simple"],
    summary: "Oxidation of benzyl alcohol to benzaldehyde.",
    catalysts: ["oxidation catalyst"],
    temperature: "Warm",
    notes: "Provides a familiar benzylic oxidation step."
  },
  {
    id: "benzaldehyde-oxidation",
    name: "Benzaldehyde Oxidation",
    reactants: ["benzaldehyde", "oxygen"],
    products: ["benzoic-acid"],
    categories: ["oxidation", "aromatic", "acid", "simple"],
    summary: "Oxidation of benzaldehyde to benzoic acid.",
    temperature: "Mild oxidative conditions",
    notes: "A clean aromatic aldehyde oxidation example."
  },
  {
    id: "ethylene-epoxidation",
    name: "Ethylene Epoxidation",
    reactants: ["ethylene", "oxygen"],
    products: ["ethylene-oxide"],
    categories: ["oxidation", "epoxidation", "feedstock", "simple"],
    summary: "Epoxidation of ethylene to ethylene oxide.",
    catalysts: ["silver catalyst"],
    temperature: "Hot",
    notes: "Useful for animated comparison with hydration and ring-opening routes."
  },
  {
    id: "propylene-epoxidation",
    name: "Propylene Epoxidation",
    reactants: ["propylene", "oxygen"],
    products: ["propylene-oxide"],
    categories: ["oxidation", "epoxidation", "feedstock", "simple"],
    summary: "Epoxidation of propylene to propylene oxide.",
    catalysts: ["oxidation catalyst"],
    temperature: "Hot",
    notes: "A simple feedstock epoxidation paired with downstream hydrolysis."
  },
  {
    id: "carbon-monoxide-oxidation",
    name: "Carbon Monoxide Oxidation",
    reactants: ["carbon-monoxide", "oxygen"],
    products: ["carbon-dioxide"],
    categories: ["oxidation", "gas-phase", "simple"],
    summary: "Oxidation of carbon monoxide to carbon dioxide.",
    temperature: "Hot gas phase",
    notes: "A compact gas-phase oxidation useful for the 3D stage."
  },
  {
    id: "nitric-oxide-oxidation",
    name: "Nitric Oxide Oxidation",
    reactants: ["nitric-oxide", "oxygen"],
    products: ["nitrogen-dioxide"],
    categories: ["oxidation", "nitrogen", "simple"],
    summary: "Oxidation of nitric oxide to nitrogen dioxide.",
    temperature: "Gas phase",
    notes: "Key air-chemistry transformation with a clear one-product result."
  },
  {
    id: "sulfur-dioxide-oxidation",
    name: "Sulfur Dioxide Oxidation",
    reactants: ["sulfur-dioxide", "oxygen", "water"],
    products: ["sulfuric-acid"],
    categories: ["oxidation", "sulfur", "process", "simple"],
    summary: "Modeled oxidation and hydration of sulfur dioxide to sulfuric acid.",
    catalysts: ["oxidation catalyst"],
    temperature: "Process conditions",
    notes: "Compresses a process sequence into one browseable simple reaction."
  },
  {
    id: "hydrogen-peroxide-disproportionation",
    name: "Hydrogen Peroxide Disproportionation",
    reactants: ["hydrogen-peroxide"],
    products: ["water", "oxygen"],
    categories: ["decomposition", "oxidation", "simple"],
    summary: "Disproportionation of hydrogen peroxide into water and oxygen.",
    catalysts: ["trace catalyst or surface"],
    temperature: "Ambient to warm",
    notes: "A clean one-to-two split reaction for the animation stage."
  },
  {
    id: "acrolein-oxidation",
    name: "Acrolein Oxidation",
    reactants: ["acrolein", "oxygen"],
    products: ["acrylic-acid"],
    categories: ["oxidation", "feedstock", "simple"],
    summary: "Oxidation of acrolein to acrylic acid.",
    temperature: "Hot oxidative conditions",
    notes: "Provides another industrially recognizable feedstock oxidation."
  }
];

const processRoutes: RoutePair[] = [
  {
    id: "hcl-sodium-hydroxide-neutralization",
    name: "Hydrochloric Acid Neutralization With Sodium Hydroxide",
    reactants: ["hydrochloric-acid", "sodium-hydroxide"],
    products: ["sodium-chloride", "water"],
    categories: ["neutralization", "acid-base", "salt-formation", "simple"],
    summary: "Neutralization of hydrochloric acid with sodium hydroxide.",
    solvent: "Aqueous phase",
    temperature: "Ambient",
    notes: "Simple acid-base quench with a clear salt and water product set."
  },
  {
    id: "hcl-potassium-hydroxide-neutralization",
    name: "Hydrochloric Acid Neutralization With Potassium Hydroxide",
    reactants: ["hydrochloric-acid", "potassium-hydroxide"],
    products: ["potassium-chloride", "water"],
    categories: ["neutralization", "acid-base", "salt-formation", "simple"],
    summary: "Neutralization of hydrochloric acid with potassium hydroxide.",
    solvent: "Aqueous phase",
    temperature: "Ambient",
    notes: "A second alkali hydroxide neutralization route."
  },
  {
    id: "hcl-sodium-bicarbonate-quench",
    name: "Hydrochloric Acid And Sodium Bicarbonate Quench",
    reactants: ["hydrochloric-acid", "sodium-bicarbonate"],
    products: ["sodium-chloride", "carbon-dioxide", "water"],
    categories: ["acid-base", "gas-evolution", "simple"],
    summary: "Acid quench of sodium bicarbonate releasing carbon dioxide.",
    solvent: "Aqueous phase",
    temperature: "Ambient",
    notes: "Good for showing product branching and gas release."
  },
  {
    id: "hcl-sodium-carbonate-quench",
    name: "Hydrochloric Acid And Sodium Carbonate Quench",
    reactants: ["hydrochloric-acid", "sodium-carbonate"],
    products: ["sodium-chloride", "carbon-dioxide", "water"],
    categories: ["acid-base", "gas-evolution", "simple"],
    summary: "Acid quench of sodium carbonate releasing carbon dioxide.",
    solvent: "Aqueous phase",
    temperature: "Ambient",
    notes: "A closely related carbonate neutralization route."
  },
  {
    id: "hcl-potassium-carbonate-quench",
    name: "Hydrochloric Acid And Potassium Carbonate Quench",
    reactants: ["hydrochloric-acid", "potassium-carbonate"],
    products: ["potassium-chloride", "carbon-dioxide", "water"],
    categories: ["acid-base", "gas-evolution", "simple"],
    summary: "Acid quench of potassium carbonate releasing carbon dioxide.",
    solvent: "Aqueous phase",
    temperature: "Ambient",
    notes: "Another salt-forming gas-evolution reaction."
  },
  {
    id: "ammonium-nitrate-formation",
    name: "Ammonium Nitrate Formation",
    reactants: ["nitric-acid", "ammonia"],
    products: ["ammonium-nitrate"],
    categories: ["neutralization", "salt-formation", "nitrogen", "simple"],
    summary: "Formation of ammonium nitrate from nitric acid and ammonia.",
    temperature: "Controlled neutralization",
    notes: "A simple fertilizer-side neutralization route."
  },
  {
    id: "ammonium-chloride-formation",
    name: "Ammonium Chloride Formation",
    reactants: ["hydrochloric-acid", "ammonia"],
    products: ["ammonium-chloride"],
    categories: ["neutralization", "salt-formation", "simple"],
    summary: "Formation of ammonium chloride from hydrochloric acid and ammonia.",
    temperature: "Ambient",
    notes: "Another compact one-product acid-base route."
  },
  {
    id: "carbon-dioxide-sodium-bicarbonate-capture",
    name: "Carbon Dioxide Capture To Sodium Bicarbonate",
    reactants: ["carbon-dioxide", "sodium-hydroxide"],
    products: ["sodium-bicarbonate"],
    categories: ["capture", "acid-base", "carbon", "simple"],
    summary: "Modeled carbon dioxide capture into sodium bicarbonate.",
    solvent: "Aqueous alkaline phase",
    temperature: "Ambient",
    notes: "Useful to animate gas capture into a single salt product."
  },
  {
    id: "carbon-dioxide-sodium-carbonate-capture",
    name: "Carbon Dioxide Capture To Sodium Carbonate",
    reactants: ["carbon-dioxide", "sodium-hydroxide"],
    products: ["sodium-carbonate", "water"],
    categories: ["capture", "acid-base", "carbon", "simple"],
    summary: "Modeled deeper caustic capture of carbon dioxide into sodium carbonate.",
    solvent: "Aqueous alkaline phase",
    temperature: "Ambient",
    notes: "Uses the same participants as bicarbonate capture but a different modeled endpoint."
  },
  {
    id: "carbon-dioxide-potassium-carbonate-capture",
    name: "Carbon Dioxide Capture To Potassium Carbonate",
    reactants: ["carbon-dioxide", "potassium-hydroxide"],
    products: ["potassium-carbonate", "water"],
    categories: ["capture", "acid-base", "carbon", "simple"],
    summary: "Modeled carbon dioxide capture into potassium carbonate.",
    solvent: "Aqueous alkaline phase",
    temperature: "Ambient",
    notes: "Complements the sodium capture routes with potassium chemistry."
  },
  {
    id: "ammonium-chloride-sodium-hydroxide-release",
    name: "Ammonium Chloride Release With Sodium Hydroxide",
    reactants: ["ammonium-chloride", "sodium-hydroxide"],
    products: ["ammonia", "sodium-chloride", "water"],
    categories: ["base-release", "gas-evolution", "simple"],
    summary: "Base release of ammonia from ammonium chloride using sodium hydroxide.",
    solvent: "Aqueous phase",
    temperature: "Ambient to warm",
    notes: "Provides a clear split into gas, salt and water."
  },
  {
    id: "ammonium-chloride-potassium-hydroxide-release",
    name: "Ammonium Chloride Release With Potassium Hydroxide",
    reactants: ["ammonium-chloride", "potassium-hydroxide"],
    products: ["ammonia", "potassium-chloride", "water"],
    categories: ["base-release", "gas-evolution", "simple"],
    summary: "Base release of ammonia from ammonium chloride using potassium hydroxide.",
    solvent: "Aqueous phase",
    temperature: "Ambient to warm",
    notes: "Parallel to the sodium-hydroxide release route."
  },
  {
    id: "urea-synthesis",
    name: "Urea Synthesis",
    reactants: ["ammonia", "carbon-dioxide"],
    products: ["urea", "water"],
    categories: ["synthesis", "nitrogen", "process", "simple"],
    summary: "Modeled synthesis of urea from ammonia and carbon dioxide.",
    temperature: "High pressure process conditions",
    notes: "Condenses a process chemistry route into a simple browseable step."
  },
  {
    id: "urea-hydrolysis",
    name: "Urea Hydrolysis",
    reactants: ["urea", "water"],
    products: ["ammonia", "carbon-dioxide"],
    categories: ["hydrolysis", "nitrogen", "simple"],
    summary: "Hydrolysis of urea back to ammonia and carbon dioxide.",
    temperature: "Aqueous conditions",
    notes: "A clean reverse split of the urea synthesis route."
  },
  {
    id: "nitrogen-fixation-arc",
    name: "Nitrogen Fixation Arc Step",
    reactants: ["nitrogen", "oxygen"],
    products: ["nitric-oxide"],
    categories: ["nitrogen", "gas-phase", "process", "simple"],
    summary: "Modeled high-energy combination of nitrogen and oxygen into nitric oxide.",
    temperature: "High-energy arc zone",
    notes: "A compact air-chemistry formation step."
  },
  {
    id: "nitrogen-dioxide-absorption",
    name: "Nitrogen Dioxide Absorption",
    reactants: ["nitrogen-dioxide", "water"],
    products: ["nitric-acid", "nitric-oxide"],
    categories: ["nitrogen", "absorption", "process", "simple"],
    summary: "Modeled absorption of nitrogen dioxide in water yielding nitric acid and nitric oxide.",
    solvent: "Water",
    temperature: "Ambient to warm",
    notes: "A classic simple absorption route in nitric-acid process storytelling."
  },
  {
    id: "sulfur-dioxide-peroxide-oxidation",
    name: "Sulfur Dioxide Peroxide Oxidation",
    reactants: ["sulfur-dioxide", "hydrogen-peroxide"],
    products: ["sulfuric-acid", "water"],
    categories: ["sulfur", "oxidation", "process", "simple"],
    summary: "Oxidative conversion of sulfur dioxide using hydrogen peroxide.",
    solvent: "Aqueous phase",
    temperature: "Mild",
    notes: "Adds a compact sulfur oxidation route with a strong oxidant."
  }
];

const combustionReactions = combustionPairs.map((pair) =>
  createReaction({
    id: `${pair.id}-combustion`,
    name: `${nameOf(pair.reactant)} Combustion`,
    reactants: [pair.reactant, "oxygen"],
    products: ["carbon-dioxide", "water"],
    categories: ["combustion", "oxidation", "energy", "simple"],
    summary: `Complete modeled combustion of ${nameOf(pair.reactant)} to carbon dioxide and water.`,
    solvent: "Gas phase / flame front",
    temperature: "High temperature",
    notes: `Useful as a simple oxidation storyboard for ${nameOf(pair.reactant)}.`
  })
);

const hydrationReactions = hydrationRoutes.map((route) => createReaction(route));
const esterReactions = esterRoutes.map((route) => createReaction(route));
const oxidationReactions = oxidationRoutes.map((route) => createReaction(route));
const processReactions = processRoutes.map((route) => createReaction(route));

export const reactionSeed: ReactionRecord[] = [
  ...combustionReactions,
  ...hydrationReactions,
  ...esterReactions,
  ...oxidationReactions,
  ...processReactions
];

for (const reaction of reactionSeed) {
  for (const moleculeId of [...reaction.reactants, ...reaction.products]) {
    if (!moleculeNameById.has(moleculeId)) {
      throw new Error(`Reaction ${reaction.id} references unknown molecule ${moleculeId}`);
    }
  }
}

if (reactionSeed.length !== 100) {
  throw new Error(`Expected 100 reactions, received ${reactionSeed.length}`);
}

const reactionIds = new Set<string>();
for (const reaction of reactionSeed) {
  if (reactionIds.has(reaction.id)) {
    throw new Error(`Duplicate reaction id detected: ${reaction.id}`);
  }
  reactionIds.add(reaction.id);
}

export default reactionSeed;
