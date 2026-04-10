import { motion } from "framer-motion";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { getFluxEntries, getReactionParticipants } from "../lib/reaction-visuals";

interface ReactionInteractionSceneProps {
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
  { x: 25, y: 26 },
  { x: 18, y: 50 },
  { x: 27, y: 74 },
  { x: 36, y: 16 }
];

const productAnchors = [
  { x: 75, y: 26 },
  { x: 82, y: 50 },
  { x: 73, y: 74 },
  { x: 64, y: 16 }
];

function getAnchoredPosition(
  role: "reactant" | "product",
  index: number,
  progress: number
) {
  const anchors = role === "reactant" ? reactantAnchors : productAnchors;
  const fallback = role === "reactant" ? { x: 24, y: 50 } : { x: 76, y: 50 };
  const anchor = anchors[index] ?? fallback;
  const inward = role === "reactant" ? 18 : -18;

  return {
    x: mix(anchor.x, 50 + inward, clamp(progress, 0, 1)),
    y: mix(anchor.y, 50 + (anchor.y - 50) * 0.3, clamp(progress, 0, 1))
  };
}

function pathFromNodeToCore(xPercent: number, yPercent: number) {
  const x = xPercent * 10;
  const y = yPercent * 6.2;
  const cx1 = mix(x, 500, 0.38);
  const cy1 = y;
  const cx2 = mix(x, 500, 0.72);
  const cy2 = 310;

  return `M ${x} ${y} C ${cx1} ${cy1}, ${cx2} ${cy2}, 500 310`;
}

export function ReactionInteractionScene({
  reaction,
  molecules,
  stepIndex,
  selectedMoleculeId,
  onInspectMolecule,
  minimal = false
}: ReactionInteractionSceneProps) {
  const reactants = getReactionParticipants(reaction.reactants, molecules);
  const products = getReactionParticipants(reaction.products, molecules);
  const activeStep = reaction.steps[stepIndex];
  const progress = reaction.steps.length > 1 ? stepIndex / (reaction.steps.length - 1) : 1;
  const atomFlux = getFluxEntries(reactants, products).slice(0, 6);

  return (
    <section className={minimal ? "reaction-interaction-scene embedded" : "reaction-interaction-scene"}>
      {minimal ? null : (
        <div className="reaction-interaction-head">
          <div>
            <p className="eyebrow">2D Assembled View</p>
            <h3>Interaction Map</h3>
          </div>
        </div>
      )}

      <div className="reaction-interaction-arena">
        <svg
          className="reaction-interaction-svg"
          viewBox="0 0 1000 620"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="reactantFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(137,240,218,0)" />
              <stop offset="100%" stopColor="rgba(137,240,218,0.45)" />
            </linearGradient>
            <linearGradient id="productFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(243,189,98,0.45)" />
              <stop offset="100%" stopColor="rgba(243,189,98,0)" />
            </linearGradient>
          </defs>

          {reactants.map((molecule, index) => {
            const { x, y } = getAnchoredPosition("reactant", index, progress);

            return (
              <path
                key={`reactant-path-${molecule.id}`}
                d={pathFromNodeToCore(x, y)}
                className={molecule.id === selectedMoleculeId ? "reaction-interaction-path selected" : "reaction-interaction-path"}
                stroke="url(#reactantFlow)"
              />
            );
          })}

          {products.map((molecule, index) => {
            const { x, y } = getAnchoredPosition("product", index, progress);

            return (
              <path
                key={`product-path-${molecule.id}`}
                d={pathFromNodeToCore(x, y)}
                className={molecule.id === selectedMoleculeId ? "reaction-interaction-path selected product" : "reaction-interaction-path product"}
                stroke="url(#productFlow)"
              />
            );
          })}

          <circle cx="500" cy="310" r="106" className="reaction-interaction-core-ring" />
          <circle cx="500" cy="310" r="154" className="reaction-interaction-core-ring outer" />
        </svg>

        {minimal ? null : (
          <div className="reaction-interaction-core-copy">
            <span className="reaction-core-kicker">step {stepIndex + 1}</span>
            <strong>{activeStep.title}</strong>
            <p>{activeStep.description}</p>
          </div>
        )}

        {reactants.map((molecule, index) => {
          const { x, y } = getAnchoredPosition("reactant", index, progress);
          const selected = molecule.id === selectedMoleculeId;

          return (
            <motion.button
              key={`reactant-node-${molecule.id}`}
              type="button"
              className={selected ? "reaction-interaction-node reactant selected" : "reaction-interaction-node reactant"}
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={false}
              animate={{ scale: selected ? 1.04 : 1, opacity: selected ? 1 : 0.9 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={() => onInspectMolecule?.(molecule.id)}
            >
              <strong>{molecule.formula}</strong>
              {selected ? <span>{molecule.name}</span> : null}
            </motion.button>
          );
        })}

        {products.map((molecule, index) => {
          const { x, y } = getAnchoredPosition("product", index, progress);
          const selected = molecule.id === selectedMoleculeId;

          return (
            <motion.button
              key={`product-node-${molecule.id}`}
              type="button"
              className={selected ? "reaction-interaction-node product selected" : "reaction-interaction-node product"}
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={false}
              animate={{ scale: selected ? 1.04 : 1, opacity: selected ? 1 : 0.9 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={() => onInspectMolecule?.(molecule.id)}
            >
              <strong>{molecule.formula}</strong>
              {selected ? <span>{molecule.name}</span> : null}
            </motion.button>
          );
        })}

        <div className="reaction-interaction-flux">
          {atomFlux.map((entry, index) => (
            <motion.div
              key={entry.symbol}
              className="reaction-interaction-flux-chip"
              initial={false}
              animate={{
                rotate: index % 2 === 0 ? [0, 2, 0] : [0, -2, 0],
                scale: [1, 1.04, 1]
              }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 }}
            >
              <strong>{entry.symbol}</strong>
              <span>{entry.left} in / {entry.right} out</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
