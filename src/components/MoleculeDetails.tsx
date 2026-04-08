import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { getMoleculeExternalLinks } from "../lib/pubchem";

interface MoleculeDetailsProps {
  molecule: MoleculeRecord;
  relatedReactions?: ReactionRecord[];
  onSelectReaction?: (reactionId: string) => void;
}

export function MoleculeDetails({ molecule, relatedReactions = [], onSelectReaction }: MoleculeDetailsProps) {
  const links = getMoleculeExternalLinks(molecule);

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
          <span>XLogP</span>
          <strong>{molecule.xlogp ?? "n/a"}</strong>
        </article>
        <article className="stat-card">
          <span>TPSA</span>
          <strong>{molecule.tpsa ?? "n/a"}</strong>
        </article>
        <article className="stat-card">
          <span>H-bond profile</span>
          <strong>
            D {molecule.hBondDonors ?? 0} / A {molecule.hBondAcceptors ?? 0}
          </strong>
        </article>
      </div>

      <div className="detail-columns">
        <article className="subpanel">
          <h3>Use cases</h3>
          <div className="tag-row">
            {molecule.uses.map((useCase) => (
              <span key={useCase} className="tag muted">
                {useCase}
              </span>
            ))}
          </div>
        </article>

        <article className="subpanel">
          <h3>Hazard notes</h3>
          <ul className="plain-list">
            {molecule.hazardNotes.map((hazard) => (
              <li key={hazard}>{hazard}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="subpanel">
        <div className="subpanel-head">
          <h3>Spectra & records</h3>
          <Sparkles size={16} />
        </div>
        <div className="reference-list">
          {molecule.spectralReferences.map((reference) => (
            <a key={`${reference.source}-${reference.label}`} href={reference.url} target="_blank" rel="noreferrer" className="reference-card">
              <div>
                <span className="reference-kind">{reference.kind}</span>
                <strong>{reference.label}</strong>
                <p>{reference.notes}</p>
              </div>
              <span className={`availability availability-${reference.availability}`}>
                {reference.availability}
              </span>
            </a>
          ))}
        </div>
      </article>

      <article className="subpanel">
        <h3>External research links</h3>
        <div className="link-grid">
          {links.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="external-link">
              <span>{link.label}</span>
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </article>

      {relatedReactions.length > 0 ? (
        <article className="subpanel">
          <div className="subpanel-head">
            <h3>Related reactions</h3>
            <Sparkles size={16} />
          </div>
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
        </article>
      ) : null}
    </section>
  );
}
