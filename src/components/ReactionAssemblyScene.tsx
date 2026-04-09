import { useMemo } from "react";
import { motion } from "framer-motion";
import { Orbit, Sparkles } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { StructureScene } from "./StructureScene";

interface ReactionAssemblySceneProps {
  reaction: ReactionRecord;
  molecules: Map<string, MoleculeRecord>;
  stepIndex: number;
  onSelectMolecule?: (moleculeId: string) => void;
}

type FluxEntry = {
  symbol: string;
  left: number;
  right: number;
};

function getParticipants(ids: string[], molecules: Map<string, MoleculeRecord>) {
  return ids
    .map((moleculeId) => molecules.get(moleculeId))
    .filter((molecule): molecule is MoleculeRecord => Boolean(molecule));
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function laneOffsets(total: number) {
  if (total <= 1) {
    return [0];
  }

  if (total === 2) {
    return [-11, 11];
  }

  if (total === 3) {
    return [-14, 0, 14];
  }

  return Array.from({ length: total }, (_, index) => -18 + (36 / Math.max(total - 1, 1)) * index);
}

function laneRows(total: number) {
  if (total <= 1) {
    return [50];
  }

  if (total === 2) {
    return [36, 64];
  }

  if (total === 3) {
    return [28, 50, 72];
  }

  return Array.from({ length: total }, (_, index) => 18 + (58 / Math.max(total - 1, 1)) * index);
}

function getNodeState(lane: "reactant" | "product", index: number, total: number, progress: number) {
  const offsets = laneOffsets(total);
  const rows = laneRows(total);
  const offset = offsets[index] ?? 0;
  const row = rows[index] ?? 50;

  if (lane === "reactant") {
    const gatherProgress = clamp(progress / 0.48, 0, 1);
    const releaseProgress = clamp((progress - 0.6) / 0.4, 0, 1);
    const startX = 18 + offset * 0.22;
    const gatherX = 38 + offset * 0.4;
    const finalX = 49 + offset * 0.12;

    return {
      x: releaseProgress > 0 ? mix(gatherX, finalX, releaseProgress) : mix(startX, gatherX, gatherProgress),
      y: mix(row, 50 + offset * 0.15, clamp(progress / 0.58, 0, 1)),
      opacity:
        releaseProgress > 0 ? mix(0.72, 0.12, releaseProgress) : mix(0.98, 0.78, clamp(progress / 0.6, 0, 1)),
      scale: releaseProgress > 0 ? mix(0.96, 0.72, releaseProgress) : mix(1, 0.97, clamp(progress / 0.55, 0, 1))
    };
  }

  const appearProgress = clamp((progress - 0.18) / 0.42, 0, 1);
  const settleProgress = clamp((progress - 0.44) / 0.56, 0, 1);
  const startX = 58 + offset * 0.12;
  const gatherX = 66 + offset * 0.4;
  const finalX = 82 + offset * 0.22;

  return {
    x: settleProgress > 0 ? mix(gatherX, finalX, settleProgress) : mix(startX, gatherX, appearProgress),
    y: mix(50 - offset * 0.15, row, clamp((progress - 0.14) / 0.72, 0, 1)),
    opacity:
      appearProgress < 1 ? mix(0.08, 0.44, appearProgress) : mix(0.44, 0.98, clamp((progress - 0.5) / 0.5, 0, 1)),
    scale:
      appearProgress < 1 ? mix(0.68, 0.9, appearProgress) : mix(0.9, 1, clamp((progress - 0.5) / 0.5, 0, 1))
  };
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

function getFluxEntries(reactants: MoleculeRecord[], products: MoleculeRecord[]): FluxEntry[] {
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
    .slice(0, 6);
}

function getFluxLabel(entry: FluxEntry) {
  if (entry.left === entry.right) {
    return "rearranging";
  }

  return entry.right > entry.left ? "forming" : "splitting";
}

const fluxPositions = [
  { x: -92, y: -58 },
  { x: 88, y: -48 },
  { x: -82, y: 64 },
  { x: 84, y: 68 },
  { x: 0, y: -96 },
  { x: 0, y: 98 }
];

export function ReactionAssemblyScene({
  reaction,
  molecules,
  stepIndex,
  onSelectMolecule
}: ReactionAssemblySceneProps) {
  const reactants = useMemo(() => getParticipants(reaction.reactants, molecules), [molecules, reaction.reactants]);
  const products = useMemo(() => getParticipants(reaction.products, molecules), [molecules, reaction.products]);
  const activeStep = reaction.steps[stepIndex];
  const progress = reaction.steps.length > 1 ? stepIndex / (reaction.steps.length - 1) : 1;
  const atomFlux = useMemo(() => getFluxEntries(reactants, products), [products, reactants]);

  return (
    <section className="reaction-assembly-panel">
      <div className="reaction-assembly-head">
        <div>
          <p className="eyebrow">3D Reaction Theatre</p>
          <h3>Assembly And Split View</h3>
        </div>

        <div className="reaction-assembly-badges">
          <div className="count-chip">
            {reactants.length} in / {products.length} out
          </div>
          <div className="reaction-truth-badge">
            <Sparkles size={14} />
            <span>modelled 3d</span>
          </div>
        </div>
      </div>

      <div className="reaction-assembly-arena">
        <motion.div
          className="reaction-assembly-trace reactants"
          initial={false}
          animate={{ scaleX: mix(0.46, 1, clamp(progress / 0.55, 0, 1)), opacity: mix(0.28, 0.58, progress) }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <motion.div
          className="reaction-assembly-trace products"
          initial={false}
          animate={{ scaleX: mix(0.46, 1, clamp((progress - 0.2) / 0.8, 0, 1)), opacity: mix(0.18, 0.5, progress) }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {reactants.map((molecule, index) => {
          const state = getNodeState("reactant", index, reactants.length, progress);
          const isFocus = molecule.id === activeStep.focusMoleculeId;

          return (
            <motion.button
              key={`reactant-${molecule.id}`}
              type="button"
              className={isFocus ? "reaction-assembly-node reactant focus" : "reaction-assembly-node reactant"}
              style={{ left: `${state.x}%`, top: `${state.y}%` }}
              initial={false}
              animate={{ opacity: state.opacity, scale: state.scale }}
              transition={{ duration: 0.55, ease: "easeInOut", delay: index * 0.05 }}
              onClick={() => onSelectMolecule?.(molecule.id)}
            >
              <div className="reaction-assembly-node-frame">
                <StructureScene molecule={molecule} compact spinning={progress < 0.72} />
              </div>
              <div className="reaction-assembly-node-copy">
                <strong>{molecule.name}</strong>
                <span>{molecule.formula}</span>
              </div>
            </motion.button>
          );
        })}

        {products.map((molecule, index) => {
          const state = getNodeState("product", index, products.length, progress);
          const isFocus = molecule.id === activeStep.focusMoleculeId;

          return (
            <motion.button
              key={`product-${molecule.id}`}
              type="button"
              className={isFocus ? "reaction-assembly-node product focus" : "reaction-assembly-node product"}
              style={{ left: `${state.x}%`, top: `${state.y}%` }}
              initial={false}
              animate={{ opacity: state.opacity, scale: state.scale }}
              transition={{ duration: 0.55, ease: "easeInOut", delay: index * 0.05 }}
              onClick={() => onSelectMolecule?.(molecule.id)}
            >
              <div className="reaction-assembly-node-frame">
                <StructureScene molecule={molecule} compact spinning={progress > 0.18} />
              </div>
              <div className="reaction-assembly-node-copy">
                <strong>{molecule.name}</strong>
                <span>{molecule.formula}</span>
              </div>
            </motion.button>
          );
        })}

        <div className="reaction-assembly-core">
          <motion.div
            className="reaction-assembly-core-ring"
            animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.82, 0.28] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="reaction-assembly-core-ring secondary"
            animate={{ scale: [1.04, 1.16, 1.04], opacity: [0.12, 0.36, 0.12] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
          />

          <div className="reaction-assembly-core-copy">
            <span className="reaction-core-kicker">step {stepIndex + 1}</span>
            <strong>{activeStep.title}</strong>
            <p>{activeStep.description}</p>
          </div>

          <div className="reaction-assembly-flux">
            {atomFlux.map((entry, index) => {
              const base = fluxPositions[index] ?? fluxPositions[fluxPositions.length - 1];

              return (
                <motion.div
                  key={entry.symbol}
                  className="reaction-assembly-flux-chip"
                  initial={false}
                  animate={{
                    x: base.x * mix(0.5, 1, clamp(progress + 0.12, 0, 1)),
                    y: base.y * mix(0.55, 1, clamp(progress + 0.12, 0, 1)),
                    opacity: mix(0.28, 0.84, clamp(progress + 0.08, 0, 1)),
                    scale: progress > 0.45 ? 1 : mix(0.8, 1, clamp(progress / 0.45, 0, 1))
                  }}
                  transition={{ duration: 0.55, ease: "easeInOut", delay: index * 0.04 }}
                >
                  <strong>{entry.symbol}</strong>
                  <span>{getFluxLabel(entry)}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="reaction-assembly-footer">
        <p className="reaction-3d-note">
          De reaction viewer toont nu meerdere 3D molecules tegelijk en modelleert hoe species naar de core
          bewegen, recombineren en weer uit elkaar lopen als products.
        </p>
        <p className="reaction-3d-note">
          De centrale atom-flux badges vatten elementaire verschuivingen uit de formules samen. Dit is een
          visuele hint, geen exacte atom-mapped mechanistische waarheid.
        </p>
        <div className="reaction-assembly-footnote">
          <Orbit size={14} />
          <span>{reaction.notes}</span>
        </div>
      </div>
    </section>
  );
}
