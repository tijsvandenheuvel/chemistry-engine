import { atomSeed } from "../data/atoms.seed";
import { periodicTable } from "../data/periodic-table";
import moleculeCatalog from "../data/molecules.catalog.json";
import reactionSeed from "../data/reactions.seed";
import type { AtomRecord, BrowserSection, MoleculeRecord, ReactionRecord } from "../types/chemistry";

const formulaTokenPattern = /([A-Z][a-z]?)(\d*)/g;

export const molecules = moleculeCatalog as MoleculeRecord[];
export const reactions = reactionSeed as ReactionRecord[];
export const moleculeMap = new Map(molecules.map((molecule) => [molecule.id, molecule]));
export const reactionMap = new Map(reactions.map((reaction) => [reaction.id, reaction]));
const curatedAtomSeedByNumber = new Map(atomSeed.map((atom) => [atom.atomicNumber, atom]));

function extractFormulaSymbols(formula: string) {
  return Array.from(formula.matchAll(formulaTokenPattern), (match) => match[1]);
}

function createAtomId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizeAtomCategory(category: string) {
  if (category.includes("nonmetal")) {
    return "nonmetal";
  }

  if (category.includes("transition metal")) {
    return "transition metal";
  }

  if (category.includes("post-transition metal")) {
    return "post-transition metal";
  }

  if (category.includes("alkaline earth")) {
    return "alkaline earth metal";
  }

  if (category.includes("alkali metal")) {
    return "alkali metal";
  }

  if (category.includes("noble gas")) {
    return "noble gas";
  }

  if (category.includes("metalloid")) {
    return "metalloid";
  }

  return category;
}

export const atoms: AtomRecord[] = periodicTable
  .map((element) => {
    const curatedAtom = curatedAtomSeedByNumber.get(element.atomicNumber);
    const relatedMoleculeIds = molecules
      .filter((molecule) => extractFormulaSymbols(molecule.formula).includes(element.symbol))
      .map((molecule) => molecule.id);
    const relatedReactionIds = reactions
      .filter((reaction) =>
        [...reaction.reactants, ...reaction.products].some((moleculeId) => relatedMoleculeIds.includes(moleculeId))
      )
      .map((reaction) => reaction.id);

    return {
      id: curatedAtom?.id ?? createAtomId(element.name),
      symbol: element.symbol,
      name: element.name,
      coverage: curatedAtom ? ("curated" as const) : ("periodic-table" as const),
      atomicNumber: element.atomicNumber,
      atomicWeight: curatedAtom?.atomicWeight ?? element.atomicWeight,
      category: curatedAtom?.category ?? normalizeAtomCategory(element.category),
      phase: curatedAtom?.phase ?? element.phase,
      period: curatedAtom?.period ?? element.period,
      group: curatedAtom?.group ?? element.group,
      electronConfiguration: curatedAtom?.electronConfiguration ?? "reference pending",
      oxidationStates: curatedAtom?.oxidationStates ?? [],
      description:
        curatedAtom?.description ??
        `Periodic table reference record for ${element.name}. This element is available in the atom viewer even when it is not yet linked to the current molecule catalog.`,
      relatedMoleculeIds,
      relatedReactionIds
    };
  })
  .sort((left, right) => left.atomicNumber - right.atomicNumber);

export const atomMap = new Map(atoms.map((atom) => [atom.id, atom]));

function includesQuery(haystack: string[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return haystack.join(" ").toLowerCase().includes(normalizedQuery);
}

export function searchMolecules(query: string, category: string) {
  return molecules.filter((molecule) => {
    const matchesCategory = category === "all" || molecule.categories.includes(category);
    const matchesQuery = includesQuery(
      [molecule.name, molecule.iupac, molecule.formula, molecule.smiles, ...molecule.categories, ...molecule.uses],
      query
    );
    return matchesCategory && matchesQuery;
  });
}

export function searchAtoms(query: string, category: string) {
  return atoms.filter((atom) => {
    const matchesCategory = category === "all" || atom.category === category;
    const matchesQuery = includesQuery(
      [
        atom.name,
        atom.symbol,
        atom.category,
        atom.phase,
        atom.electronConfiguration,
        atom.description,
        ...atom.oxidationStates
      ],
      query
    );
    return matchesCategory && matchesQuery;
  });
}

export function searchReactions(query: string, category: string) {
  return reactions.filter((reaction) => {
    const participantNames = [...reaction.reactants, ...reaction.products]
      .map((moleculeId) => moleculeMap.get(moleculeId)?.name ?? moleculeId);
    const matchesCategory = category === "all" || reaction.categories.includes(category);
    const matchesQuery = includesQuery(
      [
        reaction.name,
        reaction.summary,
        reaction.notes,
        reaction.solvent ?? "",
        reaction.temperature ?? "",
        ...reaction.categories,
        ...reaction.catalysts,
        ...participantNames
      ],
      query
    );

    return matchesCategory && matchesQuery;
  });
}

export function getCategoryFacets(section: BrowserSection) {
  if (section === "atoms") {
    return ["all", ...new Set(atoms.map((atom) => atom.category))];
  }

  if (section === "reactions") {
    return ["all", ...new Set(reactions.flatMap((reaction) => reaction.categories))];
  }

  return ["all", ...new Set(molecules.flatMap((molecule) => molecule.categories))];
}

export function getReactionsForMolecule(moleculeId: string) {
  return reactions.filter((reaction) => [...reaction.reactants, ...reaction.products].includes(moleculeId));
}

export function getMoleculesForReaction(reaction: ReactionRecord) {
  return [...reaction.reactants, ...reaction.products]
    .map((moleculeId) => moleculeMap.get(moleculeId))
    .filter((molecule): molecule is MoleculeRecord => Boolean(molecule));
}

export function getMoleculesForAtom(atomId: string) {
  const atom = atomMap.get(atomId);
  if (!atom) {
    return [];
  }

  return atom.relatedMoleculeIds
    .map((moleculeId) => moleculeMap.get(moleculeId))
    .filter((molecule): molecule is MoleculeRecord => Boolean(molecule));
}

export function getReactionsForAtom(atomId: string) {
  const atom = atomMap.get(atomId);
  if (!atom) {
    return [];
  }

  return atom.relatedReactionIds
    .map((reactionId) => reactionMap.get(reactionId))
    .filter((reaction): reaction is ReactionRecord => Boolean(reaction));
}
