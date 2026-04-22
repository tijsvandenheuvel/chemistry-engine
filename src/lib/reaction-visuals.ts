import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";

export type FluxEntry = {
  symbol: string;
  left: number;
  right: number;
};

export function getReactionParticipants(ids: string[], molecules: Map<string, MoleculeRecord>) {
  return ids
    .map((moleculeId) => molecules.get(moleculeId))
    .filter((molecule): molecule is MoleculeRecord => Boolean(molecule));
}

export function getUniqueReactionParticipants(
  reaction: ReactionRecord,
  molecules: Map<string, MoleculeRecord>
) {
  const uniqueIds = [...new Set([...reaction.reactants, ...reaction.products])];
  return getReactionParticipants(uniqueIds, molecules);
}

export function getReactionParticipantRole(reaction: ReactionRecord, moleculeId: string) {
  const isReactant = reaction.reactants.includes(moleculeId);
  const isProduct = reaction.products.includes(moleculeId);

  if (isReactant && isProduct) {
    return "reactant / product";
  }

  if (isReactant) {
    return "reactant";
  }

  if (isProduct) {
    return "product";
  }

  return "participant";
}

export function getReactionEquationLine(
  reaction: ReactionRecord,
  molecules: Map<string, MoleculeRecord>,
  arrow = "→"
) {
  const left = reaction.reactants
    .map((moleculeId) => molecules.get(moleculeId)?.formula ?? moleculeId)
    .join(" + ");
  const right = reaction.products
    .map((moleculeId) => molecules.get(moleculeId)?.formula ?? moleculeId)
    .join(" + ");

  return `${left} ${arrow} ${right}`;
}

export function getReactionCompactMeta(reaction: ReactionRecord) {
  const parts = [reaction.categories[0] ?? "reaction"];

  if (reaction.temperature) {
    parts.push(reaction.temperature);
  } else if (reaction.solvent) {
    parts.push(reaction.solvent);
  } else {
    parts.push(`${reaction.steps.length} ${reaction.steps.length === 1 ? "stage" : "stages"}`);
  }

  return parts.join(" · ");
}

function parseFormula(formula: string) {
  const counts = new Map<string, number>();

  for (const match of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    const symbol = match[1];
    const count = Number.parseInt(match[2] || "1", 10);
    counts.set(symbol, (counts.get(symbol) ?? 0) + (Number.isNaN(count) ? 1 : count));
  }

  return counts;
}

export function getFormulaAtoms(formula: string) {
  return [...parseFormula(formula)].map(([symbol, count]) => ({ symbol, count }));
}

export function getFluxEntries(reactants: MoleculeRecord[], products: MoleculeRecord[]): FluxEntry[] {
  const entries = new Map<string, FluxEntry>();

  for (const molecule of reactants) {
    for (const [symbol, count] of parseFormula(molecule.formula)) {
      const current = entries.get(symbol) ?? { symbol, left: 0, right: 0 };
      current.left += count;
      entries.set(symbol, current);
    }
  }

  for (const molecule of products) {
    for (const [symbol, count] of parseFormula(molecule.formula)) {
      const current = entries.get(symbol) ?? { symbol, left: 0, right: 0 };
      current.right += count;
      entries.set(symbol, current);
    }
  }

  return [...entries.values()]
    .sort((leftEntry, rightEntry) => {
      const leftScore = Math.abs(leftEntry.left - leftEntry.right) * 10 + leftEntry.left + leftEntry.right;
      const rightScore = Math.abs(rightEntry.left - rightEntry.right) * 10 + rightEntry.left + rightEntry.right;
      return rightScore - leftScore;
    })
    .slice(0, 8);
}
