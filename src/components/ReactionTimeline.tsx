import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FlaskConical, Orbit, Sparkles, Thermometer, Beaker, Zap, Tags } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { ReactionFlowScene } from "./ReactionFlowScene";
import { ReactionAssemblyScene } from "./ReactionAssemblyScene";
import { ReactionInteractionScene } from "./ReactionInteractionScene";
import { getReactionParticipantRole, getUniqueReactionParticipants } from "../lib/reaction-visuals";
import { ReactionEquationSchema } from "./ReactionEquationSchema";

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
  onSelectReaction: _onSelectReaction,
  onSelectMolecule
}: ReactionTimelineProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"3d" | "2d" | "split">("3d");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const reaction = useMemo(() => {
    if (reactions.length === 0) {
      return null;
    }

    return reactions.find((item) => item.id === selectedReactionId) ?? reactions[0];
  }, [reactions, selectedReactionId]);

  const participants = useMemo(() => {
    if (!reaction) {
      return [];
    }

    return getUniqueReactionParticipants(reaction, molecules);
  }, [molecules, reaction]);

  const focusMolecule = useMemo(() => {
    if (!reaction) {
      return null;
    }

    const step = reaction.steps[stepIndex];
    return step?.focusMoleculeId ? molecules.get(step.focusMoleculeId) ?? null : null;
  }, [molecules, reaction, stepIndex]);

  const selectedParticipant = useMemo(() => {
    return (
      participants.find((participant) => participant.id === selectedParticipantId) ??
      focusMolecule ??
      participants[0] ??
      null
    );
  }, [focusMolecule, participants, selectedParticipantId]);

  useEffect(() => {
    setStepIndex(0);
  }, [reaction?.id]);

  useEffect(() => {
    if (!reaction) {
      setSelectedParticipantId(null);
      return;
    }

    const validIds = new Set(participants.map((participant) => participant.id));
    if (selectedParticipantId && validIds.has(selectedParticipantId)) {
      return;
    }

    setSelectedParticipantId(reaction.steps[stepIndex]?.focusMoleculeId ?? participants[0]?.id ?? null);
  }, [participants, reaction, selectedParticipantId, stepIndex]);

  if (!reaction) {
    return null;
  }

  const selectedRole = selectedParticipant
    ? getReactionParticipantRole(reaction, selectedParticipant.id)
    : "participant";
  const activeStep = reaction.steps[stepIndex];

  const catalystLabel = reaction.catalysts.length ? reaction.catalysts.join(", ") : "No catalyst listed";

  return (
    <section className="panel reaction-panel">
      <div className="reaction-hero clean">
        <div className="reaction-hero-copy">
          <p className="eyebrow">Reaction Explorer</p>
          <h2>{reaction.name}</h2>
          <p className="reaction-summary">{reaction.summary}</p>

          <div className="reaction-hero-tags">
            <span className="tag">{reaction.categories[0] ?? "reaction"}</span>
            <span className="tag muted">{reaction.reactants.length} reactants</span>
            <span className="tag muted">{reaction.products.length} products</span>
            <span className="tag muted">{reaction.steps.length} steps</span>
          </div>
        </div>
      </div>

      <div className="reaction-overview-grid compact">
        <ReactionEquationSchema
          reaction={reaction}
          molecules={molecules}
          selectedMoleculeId={selectedParticipant?.id ?? null}
          onSelectMolecule={setSelectedParticipantId}
        />

        <article className="reaction-overview-card reaction-conditions-card">
          <div className="reaction-overview-head">
            <div>
              <span className="reaction-overview-label">Conditions</span>
              <strong>Reaction context</strong>
            </div>
          </div>

          <div className="reaction-condition-grid">
            <article className="reaction-condition-tile">
              <div className="reaction-condition-icon">
                <Thermometer size={16} />
              </div>
              <span>Temperature</span>
              <strong>{reaction.temperature ?? "Not specified"}</strong>
            </article>

            <article className="reaction-condition-tile">
              <div className="reaction-condition-icon">
                <Beaker size={16} />
              </div>
              <span>Solvent / medium</span>
              <strong>{reaction.solvent ?? "Not specified"}</strong>
            </article>

            <article className="reaction-condition-tile">
              <div className="reaction-condition-icon">
                <Zap size={16} />
              </div>
              <span>Catalyst / activation</span>
              <strong>{catalystLabel}</strong>
            </article>

            <article className="reaction-condition-tile">
              <div className="reaction-condition-icon">
                <Tags size={16} />
              </div>
              <span>Categories</span>
              <strong>{reaction.categories.slice(0, 2).join(" / ") || "Reaction"}</strong>
            </article>
          </div>
        </article>
      </div>

      <section className="reaction-theatre-shell restructured">
        <div className="reaction-theatre-head">
          <div>
            <p className="eyebrow">Reaction Theatre</p>
            <h3>Assembled interaction stage</h3>
          </div>

          <div className="reaction-view-toggle" role="tablist" aria-label="Reaction theatre view mode">
            {(["3d", "2d", "split"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "chip active" : "chip"}
                onClick={() => setViewMode(mode)}
              >
                {mode === "3d" ? "3D assembled" : mode === "2d" ? "2D assembled" : "Split"}
              </button>
            ))}
          </div>
        </div>

        <div className="reaction-theatre-stepbar">
          <div className="reaction-theatre-stepbar-copy">
            <span className="reaction-overview-label">
              Stage {stepIndex + 1} / {reaction.steps.length}
            </span>
            <strong>{activeStep.title}</strong>
            <p>{activeStep.description}</p>
          </div>

          {focusMolecule ? (
            <button
              type="button"
              className="chip reaction-theatre-stepbar-focus"
              onClick={() => setSelectedParticipantId(focusMolecule.id)}
            >
              <FlaskConical size={14} />
              <span>{focusMolecule.formula}</span>
            </button>
          ) : null}
        </div>

        <div className="reaction-theatre-stage">
          {viewMode === "3d" ? (
            <ReactionAssemblyScene
              reaction={reaction}
              molecules={molecules}
              stepIndex={stepIndex}
              selectedMoleculeId={selectedParticipant?.id ?? null}
              onInspectMolecule={setSelectedParticipantId}
              minimal
            />
          ) : null}

          {viewMode === "2d" ? (
            <ReactionInteractionScene
              reaction={reaction}
              molecules={molecules}
              stepIndex={stepIndex}
              selectedMoleculeId={selectedParticipant?.id ?? null}
              onInspectMolecule={setSelectedParticipantId}
              minimal
            />
          ) : null}

          {viewMode === "split" ? (
            <ReactionFlowScene
              reaction={reaction}
              molecules={molecules}
              stepIndex={stepIndex}
              onSelectMolecule={setSelectedParticipantId}
              selectedMoleculeId={selectedParticipant?.id ?? null}
              minimal
            />
          ) : null}
        </div>

        {selectedParticipant ? (
          <div className="reaction-participant-focus">
            <div className="reaction-participant-focus-copy">
              <span className="reaction-overview-label">Selected participant</span>
              <strong>{selectedParticipant.name}</strong>
              <p>
                {selectedParticipant.formula} · {selectedRole}
              </p>
            </div>

            <button
              type="button"
              className="chip reaction-open-participant"
              onClick={() => onSelectMolecule?.(selectedParticipant.id)}
            >
              <FlaskConical size={14} />
              <span>Open molecule dossier</span>
            </button>
          </div>
        ) : null}

        <div className="reaction-theatre-foot">
          <div className="reaction-theatre-note">
            <Sparkles size={14} />
            <span>
              Clear interaction views first. Exact atom-mapped chemistry can land on top of this later.
            </span>
          </div>
          <div className="reaction-theatre-note">
            <Orbit size={14} />
            <span>
              Click a molecule in the theatre to inspect it or open its molecule dossier.
            </span>
          </div>
        </div>
      </section>

      <section className="reaction-step-shell">
        <div className="reaction-step-head">
          <div>
            <p className="eyebrow">Step Browser</p>
            <h3>Browse reaction stages</h3>
          </div>

          <div className="reaction-step-controls">
            <button
              type="button"
              className="chip reaction-nav-button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
            >
              <ChevronLeft size={14} />
              <span>Prev step</span>
            </button>

            <div className="count-chip">
              {stepIndex + 1} / {reaction.steps.length}
            </div>

            <button
              type="button"
              className="chip reaction-nav-button"
              onClick={() => setStepIndex((current) => Math.min(reaction.steps.length - 1, current + 1))}
              disabled={stepIndex === reaction.steps.length - 1}
            >
              <span>Next step</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="reaction-step-layout">
          <article className="reaction-step-card static">
            <div className="reaction-step-card-top">
              <span className="reaction-overview-label">Stage {stepIndex + 1}</span>
              <strong>{reaction.steps[stepIndex].title}</strong>
            </div>

            <p>{reaction.steps[stepIndex].description}</p>

            {focusMolecule ? (
              <button
                type="button"
                className="focus-molecule focus-molecule-button"
                onClick={() => setSelectedParticipantId(focusMolecule.id)}
              >
                <FlaskConical size={16} />
                <span>
                  Focus molecule: {focusMolecule.name} · {focusMolecule.formula}
                </span>
              </button>
            ) : (
              <div className="reaction-step-muted">
                This step describes a broader reaction transition rather than a single focus molecule.
              </div>
            )}
          </article>

          <div className="reaction-step-rail">
            {reaction.steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                className={index === stepIndex ? "reaction-step-stop active" : "reaction-step-stop"}
                onClick={() => setStepIndex(index)}
              >
                <span>{index + 1}</span>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
