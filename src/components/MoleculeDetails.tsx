import { ArrowRight } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { DisclosureSection } from "./DisclosureSection";
import { SourcesSection } from "./SourcesSection";
import { getMoleculeSourceEntries } from "../lib/sources";

interface MoleculeDetailsProps {
  molecule: MoleculeRecord;
  relatedReactions?: ReactionRecord[];
  onSelectReaction?: (reactionId: string) => void;
}

export function MoleculeDetails({ molecule, relatedReactions = [], onSelectReaction }: MoleculeDetailsProps) {
  const sourceEntries = getMoleculeSourceEntries(molecule);

  return (
    <section className="panel detail-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Molecule Dossier</p>
          <h2>{molecule.name}</h2>
        </div>
        <div className="count-chip">{molecule.formula}</div>
      </div>

      <p className="detail-intro">{molecule.description}</p>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Molecular weight</span>
          <strong>{molecule.molecularWeight.toFixed(2)}</strong>
        </article>
        <article className="stat-card">
          <span>Exact mass</span>
          <strong>{molecule.exactMass?.toFixed(3) ?? "n/a"}</strong>
        </article>
        <article className="stat-card">
          <span>Complexity</span>
          <strong>{molecule.complexity ?? "n/a"}</strong>
        </article>
        <article className="stat-card">
          <span>H-bond profile</span>
          <strong>
            D {molecule.hBondDonors ?? 0} / A {molecule.hBondAcceptors ?? 0}
          </strong>
        </article>
      </div>

      <div className="detail-stack">
        <DisclosureSection
          title="Use cases"
          count={molecule.uses.length}
          preview="Open the applied use list for this molecule."
        >
          <div className="tag-row">
            {molecule.uses.map((useCase) => (
              <span key={useCase} className="tag muted">
                {useCase}
              </span>
            ))}
          </div>
        </DisclosureSection>

        <DisclosureSection
          title="Hazard notes"
          count={molecule.hazardNotes.length}
          preview="Open the current hazard summary and caution notes."
        >
          <ul className="plain-list">
            {molecule.hazardNotes.map((hazard) => (
              <li key={hazard}>{hazard}</li>
            ))}
          </ul>
        </DisclosureSection>

        <SourcesSection
          entries={sourceEntries}
          preview="Spectra records and external research links are combined into one closed source list."
        />

        <DisclosureSection
          title="Related reactions"
          count={relatedReactions.length}
          preview="Open the linked reaction list for this molecule."
        >
          <div className="browser-link-list">
            {relatedReactions.map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                className="browser-link-card"
                onClick={() => onSelectReaction?.(reaction.id)}
              >
                <div>
                  <strong>{reaction.name}</strong>
                  <p>{reaction.summary}</p>
                </div>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </DisclosureSection>
      </div>
    </section>
  );
}
