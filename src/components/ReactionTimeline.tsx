import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FlaskConical } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { StructureScene } from "./StructureScene";

interface ReactionTimelineProps {
  reactions: ReactionRecord[];
  molecules: Map<string, MoleculeRecord>;
}

export function ReactionTimeline({ reactions, molecules }: ReactionTimelineProps) {
  const [reactionIndex, setReactionIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const reaction = reactions[reactionIndex];

  useEffect(() => {
    setStepIndex(0);
  }, [reactionIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % reaction.steps.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [reaction.id, reaction.steps.length]);

  const focusMolecule = useMemo(() => {
    const step = reaction.steps[stepIndex];
    return step.focusMoleculeId ? molecules.get(step.focusMoleculeId) : null;
  }, [molecules, reaction.steps, stepIndex]);
  const playbackMolecule = focusMolecule ?? molecules.get(reaction.reactants[0]) ?? molecules.get(reaction.products[0]) ?? null;

  return (
    <section className="panel reaction-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Animated Reactions</p>
          <h2>{reaction.name}</h2>
        </div>
        <div className="reaction-switcher">
          {reactions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === reactionIndex ? "chip active" : "chip"}
              onClick={() => setReactionIndex(index)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <p className="reaction-summary">{reaction.summary}</p>

      <div className="equation-row">
        <div className="equation-group">
          {reaction.reactants.map((reactantId) => {
            const molecule = molecules.get(reactantId);
            return molecule ? <span key={reactantId} className="equation-node">{molecule.name}</span> : null;
          })}
        </div>
        <ArrowRight size={20} />
        <div className="equation-group">
          {reaction.products.map((productId) => {
            const molecule = molecules.get(productId);
            return molecule ? <span key={productId} className="equation-node product">{molecule.name}</span> : null;
          })}
        </div>
      </div>

      <div className="reaction-meta">
        <span>Catalysts: {reaction.catalysts.length ? reaction.catalysts.join(", ") : "none listed"}</span>
        <span>Solvent: {reaction.solvent ?? "not specified"}</span>
        <span>Temperature: {reaction.temperature ?? "not specified"}</span>
      </div>

      <div className="reaction-stage">
        <AnimatePresence mode="wait">
          <motion.article
            key={`${reaction.id}-${stepIndex}`}
            className="stage-card"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -28, scale: 0.96 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="stage-index">Step {stepIndex + 1}</div>
            <h3>{reaction.steps[stepIndex].title}</h3>
            <p>{reaction.steps[stepIndex].description}</p>
            {focusMolecule ? (
              <div className="focus-molecule">
                <FlaskConical size={16} />
                <span>
                  Focus: {focusMolecule.name} · {focusMolecule.formula}
                </span>
              </div>
            ) : null}
          </motion.article>
        </AnimatePresence>

        <div className="reaction-sidecar">
          {playbackMolecule ? (
            <div className="reaction-3d-panel">
              <div className="reaction-3d-head">
                <div>
                  <p className="eyebrow">3D Reaction Loop</p>
                  <h3>{playbackMolecule.name}</h3>
                </div>
                <div className="count-chip">step {stepIndex + 1}</div>
              </div>
              <div className="reaction-3d-frame">
                <StructureScene molecule={playbackMolecule} compact />
              </div>
              <p className="reaction-3d-note">
                De 3D loop volgt de actieve reaction step en schakelt automatisch tussen
                reactants, transformation focus en product state.
              </p>
            </div>
          ) : null}

          <div className="timeline-rail">
            {reaction.steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                className={index === stepIndex ? "timeline-stop active" : "timeline-stop"}
                onClick={() => setStepIndex(index)}
              >
                <span>{index + 1}</span>
                <small>{step.title}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
