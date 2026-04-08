import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";

interface ReactionFlowSceneProps {
  reaction: ReactionRecord;
  molecules: Map<string, MoleculeRecord>;
  stepIndex: number;
  onSelectMolecule?: (moleculeId: string) => void;
}

function getParticipants(ids: string[], molecules: Map<string, MoleculeRecord>) {
  return ids
    .map((moleculeId) => molecules.get(moleculeId))
    .filter((molecule): molecule is MoleculeRecord => Boolean(molecule));
}

export function ReactionFlowScene({
  reaction,
  molecules,
  stepIndex,
  onSelectMolecule
}: ReactionFlowSceneProps) {
  const reactants = getParticipants(reaction.reactants, molecules);
  const products = getParticipants(reaction.products, molecules);
  const activeStep = reaction.steps[stepIndex];
  const progress = reaction.steps.length > 1 ? stepIndex / (reaction.steps.length - 1) : 1;
  const focusMoleculeId = activeStep.focusMoleculeId;

  return (
    <section className="reaction-flow-scene">
      <div className="reaction-flow-head">
        <div>
          <p className="eyebrow">Reaction Pass</p>
          <h3>Modelled Structural Transition</h3>
        </div>
        <div className="reaction-truth-badge">
          <Sparkles size={14} />
          <span>modelled</span>
        </div>
      </div>

      <div className="reaction-flow-grid">
        <div className="reaction-lane">
          <span className="reaction-lane-label">Reactants</span>
          {reactants.map((molecule, index) => (
            <motion.button
              key={molecule.id}
              type="button"
              className={molecule.id === focusMoleculeId ? "reaction-species-card focus" : "reaction-species-card"}
              initial={false}
              animate={{
                opacity: 0.95 - progress * 0.3,
                x: progress * 10,
                scale: molecule.id === focusMoleculeId ? 1.02 : 1
              }}
              transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.04 }}
              onClick={() => onSelectMolecule?.(molecule.id)}
            >
              <strong>{molecule.name}</strong>
              <span>{molecule.formula}</span>
            </motion.button>
          ))}
        </div>

        <div className="reaction-core">
          <motion.div
            className="reaction-core-ring"
            animate={{ scale: [1, 1.05, 1], opacity: [0.46, 0.88, 0.46] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="reaction-core-ring secondary"
            animate={{ scale: [1.04, 1.14, 1.04], opacity: [0.2, 0.46, 0.2] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
          />

          <div className="reaction-core-body">
            <span className="reaction-core-kicker">
              step {stepIndex + 1} / {reaction.steps.length}
            </span>
            <strong>{activeStep.title}</strong>
            <p>{activeStep.description}</p>
          </div>

          <div className="reaction-context-strip">
            <span>{reaction.catalysts.length > 0 ? `Catalyst: ${reaction.catalysts.join(", ")}` : "Catalyst: none listed"}</span>
            <span>Solvent: {reaction.solvent ?? "not specified"}</span>
            <span>Temperature: {reaction.temperature ?? "not specified"}</span>
          </div>
        </div>

        <div className="reaction-lane products">
          <span className="reaction-lane-label">Products</span>
          {products.map((molecule, index) => (
            <motion.button
              key={molecule.id}
              type="button"
              className={molecule.id === focusMoleculeId ? "reaction-species-card product focus" : "reaction-species-card product"}
              initial={false}
              animate={{
                opacity: 0.58 + progress * 0.4,
                x: (1 - progress) * -10,
                scale: molecule.id === focusMoleculeId ? 1.02 : 1
              }}
              transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.04 }}
              onClick={() => onSelectMolecule?.(molecule.id)}
            >
              <strong>{molecule.name}</strong>
              <span>{molecule.formula}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <p className="reaction-honesty-note">
        Deze visualisatie toont de structurele overgang als gemodelleerde reaction pass.
        Er is in de huidige dataset nog geen betrouwbare atom mapping geladen om dit als exacte,
        atoom-resolved mechanistische animatie te presenteren.
      </p>
    </section>
  );
}
