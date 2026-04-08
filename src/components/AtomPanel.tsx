import { ArrowRight, Atom as AtomIcon } from "lucide-react";
import type { AtomRecord, MoleculeRecord, ReactionRecord } from "../types/chemistry";

interface AtomPanelProps {
  atom: AtomRecord;
  relatedMolecules: MoleculeRecord[];
  relatedReactions: ReactionRecord[];
  onSelectMolecule: (moleculeId: string) => void;
  onSelectReaction: (reactionId: string) => void;
}

export function AtomPanel({
  atom,
  relatedMolecules,
  relatedReactions,
  onSelectMolecule,
  onSelectReaction
}: AtomPanelProps) {
  return (
    <>
      <section className="panel viewer-panel atom-viewer-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Atom View</p>
            <h2>{atom.name}</h2>
          </div>
          <div className="viewer-status">
            <AtomIcon size={16} />
            <span>{atom.symbol}</span>
          </div>
        </div>

        <div className="atom-stage">
          <div className="atom-core">
            <span className="atom-core-symbol">{atom.symbol}</span>
            <small>atomic number {atom.atomicNumber}</small>
          </div>

          <div className="atom-stage-grid">
            <article className="stat-card">
              <span>Atomic weight</span>
              <strong>{atom.atomicWeight.toFixed(3)}</strong>
            </article>
            <article className="stat-card">
              <span>Family</span>
              <strong>{atom.category}</strong>
            </article>
            <article className="stat-card">
              <span>Period / group</span>
              <strong>
                {atom.period} / {atom.group}
              </strong>
            </article>
            <article className="stat-card">
              <span>Standard phase</span>
              <strong>{atom.phase}</strong>
            </article>
          </div>
        </div>

        <div className="viewer-caption">
          <span>{atom.electronConfiguration}</span>
          <span>{atom.oxidationStates.join(", ")}</span>
        </div>
      </section>

      <section className="panel detail-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Atom Dossier</p>
            <h2>{atom.name}</h2>
          </div>
          <div className="count-chip">{relatedMolecules.length} linked molecules</div>
        </div>

        <p className="detail-intro">{atom.description}</p>

        <div className="detail-columns">
          <article className="subpanel">
            <h3>Electronic profile</h3>
            <ul className="plain-list">
              <li>Electron configuration: {atom.electronConfiguration}</li>
              <li>Common oxidation states: {atom.oxidationStates.join(", ")}</li>
              <li>Category: {atom.category}</li>
            </ul>
          </article>

          <article className="subpanel">
            <h3>System context</h3>
            <ul className="plain-list">
              <li>{relatedMolecules.length} molecules currently include this atom.</li>
              <li>{relatedReactions.length} reactions currently traverse molecules that contain this atom.</li>
              <li>Current atom data is limited to elements present in the loaded catalog.</li>
            </ul>
          </article>
        </div>

        <article className="subpanel">
          <div className="subpanel-head">
            <h3>Linked molecules</h3>
            <AtomIcon size={16} />
          </div>
          <div className="browser-link-list">
            {relatedMolecules.slice(0, 18).map((molecule) => (
              <button
                key={molecule.id}
                type="button"
                className="browser-link-card"
                onClick={() => onSelectMolecule(molecule.id)}
              >
                <div>
                  <strong>{molecule.name}</strong>
                  <p>{molecule.formula}</p>
                </div>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </article>

        <article className="subpanel">
          <div className="subpanel-head">
            <h3>Linked reactions</h3>
            <AtomIcon size={16} />
          </div>
          <div className="browser-link-list">
            {relatedReactions.map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                className="browser-link-card"
                onClick={() => onSelectReaction(reaction.id)}
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
      </section>
    </>
  );
}
