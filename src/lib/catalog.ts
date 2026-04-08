import moleculeCatalog from "../data/molecules.catalog.json";
import reactionSeed from "../data/reactions.seed.json";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";

export const molecules = moleculeCatalog as MoleculeRecord[];
export const reactions = reactionSeed as ReactionRecord[];

export const moleculeMap = new Map(molecules.map((molecule) => [molecule.id, molecule]));

export function searchMolecules(query: string, category: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return molecules.filter((molecule) => {
    const matchesCategory = category === "all" || molecule.categories.includes(category);
    const haystack = [
      molecule.name,
      molecule.iupac,
      molecule.formula,
      molecule.smiles,
      ...molecule.categories,
      ...molecule.uses
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}

export function getCategoryFacets() {
  return ["all", ...new Set(molecules.flatMap((molecule) => molecule.categories))];
}
