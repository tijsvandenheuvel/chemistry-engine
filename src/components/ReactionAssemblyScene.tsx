import { motion } from "framer-motion";
import { Orbit, Sparkles } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { StructureScene } from "./StructureScene";
import { getFluxEntries, getReactionParticipants } from "../lib/reaction-visuals";

interface ReactionAssemblySceneProps {
  reaction: ReactionRecord;
  molecules: Map<string, MoleculeRecord>;
  stepIndex: number;
  selectedMoleculeId?: string | null;
  onInspectMolecule?: (moleculeId: string) => void;
  minimal?: boolean;
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const reactantAnchors = [
  { x: 22, y: 28 },
  { x: 18, y: 50 },
  { x: 22, y: 72 },
  { x: 30, y: 18 }
];

const productAnchors = [
  { x: 78, y: 28 },
  { x: 82, y: 50 },
  { x: 78, y: 72 },
  { x: 70, y: 18 }
];

function getNodePosition(role: "reactant" | "product", index: number, progress: number) {
  const anchors = role === "reactant" ? reactantAnchors : productAnchors;
  const fallback = role === "reactant" ? { x: 20, y: 50 } : { x: 80, y: 50 };
  const anchor = anchors[index] ?? fallback;
  const target =
    role === "reactant"
      ? [
          { x: 38, y: 34 },
          { x: 34, y: 50 },
          { x: 38, y: 66 },
          { x: 44, y: 24 }
        ][index] ?? { x: 36, y: 50 }
      : [
          { x: 62, y: 34 },
          { x: 66, y: 50 },
          { x: 62, y: 66 },
          { x: 56, y: 24 }
        ][index] ?? { x: 64, y: 50 };
  const easedProgress = clamp(progress * 0.88, 0, 1);

  return {
    x: mix(anchor.x, target.x, easedProgress),
    y: mix(anchor.y, target.y, easedProgress)
  };
}

function getFluxLabel(left: number, right: number) {
  if (left === right) {
    return "stable";
  }

  return right > left ? "forming" : "splitting";
}

export function ReactionAssemblyScene({
  reaction,
  molecules,
  stepIndex,
  selectedMoleculeId,
  onInspectMolecule,
  minimal = false
}: ReactionAssemblySceneProps) {
  const reactants = getReactionParticipants(reaction.reactants, molecules);
  const products = getReactionParticipants(reaction.products, molecules);
  const activeStep = reaction.steps[stepIndex];
  const progress = reaction.steps.length > 1 ? stepIndex / (reaction.steps.length - 1) : 1;
  const atomFlux = getFluxEntries(reactants, products).slice(0, 6);

  return (
    <section className={minimal ? "reaction-assembly-panel embedded" : "reaction-assembly-panel"}>
      {minimal ? null : (
        <div className="reaction-assembly-head">
          <div>
            <p className="eyebrow">3D Reaction Theatre</p>
            <h3>Assembled Molecular Stage</h3>
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
      )}

      <div className="reaction-assembly-arena clean">
        <motion.div
          className="reaction-assembly-reactor-glow"
          animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.72, 0.4] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="reaction-assembly-reactor-glow outer"
          animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.34, 0.18] }}
          transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
        />

        {minimal ? null : (
          <div className="reaction-assembly-core clean">
            <span className="reaction-core-kicker">step {stepIndex + 1}</span>
            <strong>{activeStep.title}</strong>
            <p>{activeStep.description}</p>
          </div>
        )}

        {reactants.map((molecule, index) => {
          const { x, y } = getNodePosition("reactant", index, progress);
          const selected = molecule.id === selectedMoleculeId;

          return (
            <motion.button
              key={`reactant-${molecule.id}`}
              type="button"
              className={selected ? "reaction-stage-model reactant selected" : "reaction-stage-model reactant"}
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={false}
              animate={{
                opacity: selected ? 1 : 0.92,
                scale: selected ? 1.05 : 1
              }}
              transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}
              onClick={() => onInspectMolecule?.(molecule.id)}
            >
              <div className="reaction-stage-model-view">
                <StructureScene molecule={molecule} compact spinning />
              </div>
              {selected ? (
                <div className="reaction-stage-model-label">
                  <strong>{molecule.formula}</strong>
                  <span>{molecule.name}</span>
                </div>
              ) : null}
            </motion.button>
          );
        })}

        {products.map((molecule, index) => {
          const { x, y } = getNodePosition("product", index, progress);
          const selected = molecule.id === selectedMoleculeId;

          return (
            <motion.button
              key={`product-${molecule.id}`}
              type="button"
              className={selected ? "reaction-stage-model product selected" : "reaction-stage-model product"}
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={false}
              animate={{
                opacity: selected ? 1 : 0.92,
                scale: selected ? 1.05 : 1
              }}
              transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.05 }}
              onClick={() => onInspectMolecule?.(molecule.id)}
            >
              <div className="reaction-stage-model-view">
                <StructureScene molecule={molecule} compact spinning />
              </div>
              {selected ? (
                <div className="reaction-stage-model-label">
                  <strong>{molecule.formula}</strong>
                  <span>{molecule.name}</span>
                </div>
              ) : null}
            </motion.button>
          );
        })}

        <div className="reaction-assembly-flux clean">
          {atomFlux.map((entry, index) => (
            <motion.div
              key={entry.symbol}
              className="reaction-assembly-flux-chip"
              initial={false}
              animate={{
                rotate: index % 2 === 0 ? [0, 3, 0] : [0, -3, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.08 }}
            >
              <strong>{entry.symbol}</strong>
              <span>{getFluxLabel(entry.left, entry.right)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {minimal ? null : (
        <div className="reaction-assembly-footer">
          <p className="reaction-3d-note">
            Deze 3D stage geeft deelnemers meer schermruimte en vermijdt zware kaarten rond elke molecule.
          </p>
          <div className="reaction-assembly-footnote">
            <Orbit size={14} />
            <span>{reaction.notes}</span>
          </div>
        </div>
      )}
    </section>
  );
}
