import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { ReactionFlowScene } from "./ReactionFlowScene";
import { ReactionAssemblyScene } from "./ReactionAssemblyScene";

interface ReactionTimelineProps {
  reactions: ReactionRecord[];
  molecules: Map<string, MoleculeRecord>;
  selectedReactionId?: string;
  onSelectReaction?: (reactionId: string) => void;
  onSelectMolecule?: (moleculeId: string) => void;
}

export function ReactionTimeline({
  reactions,
  molecules,
  selectedReactionId,
  onSelectReaction,
  onSelectMolecule
}: ReactionTimelineProps) {
  const [reactionIndex, setReactionIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const reaction = reactions[reactionIndex];

  useEffect(() => {
    if (!selectedReactionId) {
      return;
    }

    const nextIndex = reactions.findIndex((item) => item.id === selectedReactionId);
    if (nextIndex >= 0) {
      setReactionIndex(nextIndex);
    }
  }, [reactions, selectedReactionId]);

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
  const reactionPosition = reactionIndex + 1;
  const reactionWindow = useMemo(() => {
    if (reactions.length <= 8) {
      return reactions.map((item, index) => ({ item, index }));
    }

    const maxStart = reactions.length - 8;
    const start = Math.min(Math.max(reactionIndex - 3, 0), maxStart);

    return reactions.slice(start, start + 8).map((item, offset) => ({
      item,
      index: start + offset
    }));
  }, [reactionIndex, reactions]);

  return (
    <section className="panel reaction-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Animated Reactions</p>
          <h2>{reaction.name}</h2>
        </div>

        <div className="reaction-navigator">
          <button
            type="button"
            className="chip reaction-nav-button"
            onClick={() => {
              const nextIndex = reactionIndex === 0 ? reactions.length - 1 : reactionIndex - 1;
              setReactionIndex(nextIndex);
              onSelectReaction?.(reactions[nextIndex].id);
            }}
            aria-label="Previous reaction"
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          <label className="reaction-picker">
            <span className="reaction-picker-label">reaction</span>
            <select
              value={reaction.id}
              onChange={(event) => {
                const nextIndex = reactions.findIndex((item) => item.id === event.target.value);
                if (nextIndex >= 0) {
                  setReactionIndex(nextIndex);
                  onSelectReaction?.(reactions[nextIndex].id);
                }
              }}
            >
              {reactions.map((item, index) => (
                <option key={item.id} value={item.id}>
                  {index + 1}. {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="count-chip">
            {reactionPosition} / {reactions.length}
          </div>

          <button
            type="button"
            className="chip reaction-nav-button"
            onClick={() => {
              const nextIndex = reactionIndex === reactions.length - 1 ? 0 : reactionIndex + 1;
              setReactionIndex(nextIndex);
              onSelectReaction?.(reactions[nextIndex].id);
            }}
            aria-label="Next reaction"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="reaction-switcher">
        {reactionWindow.map(({ item, index }) => (
          <button
            key={item.id}
            type="button"
            className={index === reactionIndex ? "chip active" : "chip"}
            onClick={() => {
              setReactionIndex(index);
              onSelectReaction?.(item.id);
            }}
          >
            {item.name}
          </button>
        ))}
        {reactions.length > 8 ? (
          <span className="count-chip reaction-switcher-count">
            +{reactions.length - 8} more in picker
          </span>
        ) : null}
      </div>

      <p className="reaction-summary">{reaction.summary}</p>

      <div className="tag-row reaction-tag-row">
        {reaction.categories.map((category) => (
          <span key={category} className="tag">
            {category}
          </span>
        ))}
      </div>

      <div className="equation-row">
        <div className="equation-group">
          {reaction.reactants.map((reactantId) => {
            const molecule = molecules.get(reactantId);
            return molecule ? (
              <button
                key={reactantId}
                type="button"
                className="equation-node"
                onClick={() => onSelectMolecule?.(reactantId)}
              >
                {molecule.name}
              </button>
            ) : null;
          })}
        </div>
        <ArrowRight size={20} />
        <div className="equation-group">
          {reaction.products.map((productId) => {
            const molecule = molecules.get(productId);
            return molecule ? (
              <button
                key={productId}
                type="button"
                className="equation-node product"
                onClick={() => onSelectMolecule?.(productId)}
              >
                {molecule.name}
              </button>
            ) : null;
          })}
        </div>
      </div>

      <div className="reaction-meta">
        <span>Catalysts: {reaction.catalysts.length ? reaction.catalysts.join(", ") : "none listed"}</span>
        <span>Solvent: {reaction.solvent ?? "not specified"}</span>
        <span>Temperature: {reaction.temperature ?? "not specified"}</span>
      </div>

      <ReactionFlowScene
        reaction={reaction}
        molecules={molecules}
        stepIndex={stepIndex}
        onSelectMolecule={onSelectMolecule}
      />

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
              <button
                type="button"
                className="focus-molecule focus-molecule-button"
                onClick={() => onSelectMolecule?.(focusMolecule.id)}
              >
                <FlaskConical size={16} />
                <span>
                  Focus: {focusMolecule.name} · {focusMolecule.formula}
                </span>
              </button>
            ) : null}
          </motion.article>
        </AnimatePresence>

        <div className="reaction-sidecar">
          <ReactionAssemblyScene
            reaction={reaction}
            molecules={molecules}
            stepIndex={stepIndex}
            onSelectMolecule={onSelectMolecule}
          />

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
