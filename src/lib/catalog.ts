import { atomSeed } from "../data/atoms.seed";
import moleculeCatalog from "../data/molecules.catalog.json";
import reactionSeed from "../data/reactions.seed.json";
import type { AtomRecord, BrowserSection, MoleculeRecord, ReactionRecord } from "../types/chemistry";

const formulaTokenPattern = /([A-Z][a-z]?)(\d*)/g;

export const molecules = moleculeCatalog as MoleculeRecord[];
export const reactions = reactionSeed as ReactionRecord[];
export const moleculeMap = new Map(molecules.map((molecule) => [molecule.id, molecule]));
export const reactionMap = new Map(reactions.map((reaction) => [reaction.id, reaction]));

function extractFormulaSymbols(formula: string) {
  return Array.from(formula.matchAll(formulaTokenPattern), (match) => match[1]);
}

export const atoms: AtomRecord[] = atomSeed
  .map((atom) => {
    const relatedMoleculeIds = molecules
      .filter((molecule) => extractFormulaSymbols(molecule.formula).includes(atom.symbol))
      .map((molecule) => molecule.id);
    const relatedReactionIds = reactions
      .filter((reaction) =>
        [...reaction.reactants, ...reaction.products].some((moleculeId) => relatedMoleculeIds.includes(moleculeId))
      )
      .map((reaction) => reaction.id);

    return {
      ...atom,
      relatedMoleculeIds,
      relatedReactionIds
    };
  })
  .filter((atom) => atom.relatedMoleculeIds.length > 0)
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
