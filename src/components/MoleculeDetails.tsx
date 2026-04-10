import { useState } from "react";
import { ArrowRight, Download, ShieldAlert } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { DisclosureSection } from "./DisclosureSection";
import { SourcesSection } from "./SourcesSection";
import { getMoleculeSourceEntries } from "../lib/sources";
import { downloadMoleculeSafetySheetPdf, fetchMoleculeSafetyRecord } from "../lib/safety";
import { useMoleculeSafety } from "../hooks/useSafety";
import { useMoleculeVerification } from "../hooks/useVerification";
import { VerificationSection } from "./VerificationSection";

interface MoleculeDetailsProps {
  molecule: MoleculeRecord;
  relatedReactions?: ReactionRecord[];
  onSelectReaction?: (reactionId: string) => void;
}

export function MoleculeDetails({ molecule, relatedReactions = [], onSelectReaction }: MoleculeDetailsProps) {
  const sourceEntries = getMoleculeSourceEntries(molecule);
  const { record: safety, loading: loadingSafety } = useMoleculeSafety(molecule);
  const { report: verification, loading: loadingVerification } = useMoleculeVerification(molecule);
  const [downloadingSafety, setDownloadingSafety] = useState(false);

  async function handleDownloadSafety() {
    setDownloadingSafety(true);

    try {
      const freshSafety = await fetchMoleculeSafetyRecord(molecule);
      downloadMoleculeSafetySheetPdf(molecule, freshSafety);
    } finally {
      setDownloadingSafety(false);
    }
  }

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

        <VerificationSection
          report={verification}
          loading={loadingVerification}
          preview="Cross-source checks stay folded away until you need to inspect verified fields or disagreements."
        />

        <DisclosureSection
          title="Safety sheet"
          count={
            safety.hazardStatements.length +
            safety.precautionaryStatements.length +
            safety.physicalProperties.length +
            safety.sourceLinks.length
          }
          preview="Source-backed GHS, physical properties and PDF export stay closed until needed."
        >
          <div className="safety-sheet">
            <div className="safety-toolbar">
              <div className="tag-row">
                <span className={safety.status === "source-backed" ? "availability availability-open" : "availability availability-neutral"}>
                  {safety.status === "source-backed" ? "source-backed" : safety.status === "summary-only" ? "summary + lookup" : "source needed"}
                </span>
                {safety.signalWord ? <span className="count-chip safety-signal-chip">{safety.signalWord}</span> : null}
                {loadingSafety ? <span className="availability availability-neutral">syncing PubChem</span> : null}
              </div>

              <button
                type="button"
                className="chip safety-download-button"
                onClick={handleDownloadSafety}
                disabled={downloadingSafety}
              >
                <Download size={14} />
                <span>{downloadingSafety ? "Building PDF..." : "Download safety PDF"}</span>
              </button>
            </div>

            <article className="subpanel safety-summary-panel">
              <div className="subpanel-head">
                <h3>Safety overview</h3>
                <ShieldAlert size={16} />
              </div>
              <p className="detail-intro compact-intro">{safety.summary}</p>
              {safety.note ? <p className="safety-note">{safety.note}</p> : null}
            </article>

            <div className="safety-grid">
              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Hazard statements</h3>
                  <span className="count-chip">{safety.hazardStatements.length}</span>
                </div>

                {safety.hazardStatements.length > 0 ? (
                  <div className="safety-list">
                    {safety.hazardStatements.map((statement) => (
                      <div key={statement.code} className="safety-line-item">
                        <strong>{statement.code}</strong>
                        <p>{statement.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="detail-intro compact-intro">No source-backed H statements are synced yet for this record.</p>
                )}
              </article>

              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Precautionary statements</h3>
                  <span className="count-chip">{safety.precautionaryStatements.length}</span>
                </div>

                {safety.precautionaryStatements.length > 0 ? (
                  <div className="safety-list">
                    {safety.precautionaryStatements.map((statement) => (
                      <div key={statement.code} className="safety-line-item">
                        <strong>{statement.code}</strong>
                        <p>{statement.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="detail-intro compact-intro">No source-backed P statements are synced yet for this record.</p>
                )}
              </article>
            </div>

            <div className="safety-grid">
              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Pictograms</h3>
                  <span className="count-chip">{safety.pictograms.length}</span>
                </div>

                {safety.pictograms.length > 0 ? (
                  <div className="safety-pictogram-grid">
                    {safety.pictograms.map((pictogram) => (
                      <div key={pictogram.code} className="safety-pictogram-card">
                        <img src={pictogram.url} alt={pictogram.label} className="safety-pictogram-image" />
                        <strong>{pictogram.label}</strong>
                        <span>{pictogram.code}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="detail-intro compact-intro">No pictograms are available in the current safety summary.</p>
                )}
              </article>

              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Physical properties</h3>
                  <span className="count-chip">{safety.physicalProperties.length}</span>
                </div>

                {safety.physicalProperties.length > 0 ? (
                  <div className="safety-property-list">
                    {safety.physicalProperties.map((property) => (
                      <div key={property.label} className="safety-property-row">
                        <span>{property.label}</span>
                        <strong>{property.value}</strong>
                        {property.source ? <small>{property.source}</small> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="detail-intro compact-intro">No physical properties are attached yet.</p>
                )}
              </article>
            </div>

            <div className="safety-grid">
              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Handling notes</h3>
                  <span className="count-chip">{safety.handlingNotes.length}</span>
                </div>
                <ul className="plain-list">
                  {safety.handlingNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </article>

              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Safety sources</h3>
                  <span className="count-chip">{safety.sourceLinks.length}</span>
                </div>
                <div className="reference-list compact-reference-list">
                  {safety.sourceLinks.map((entry) => (
                    <a
                      key={entry.label}
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="reference-card"
                    >
                      <div>
                        <span className="reference-kind">{entry.kind}</span>
                        <strong>{entry.label}</strong>
                        <p>{entry.url}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </article>
            </div>
          </div>
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
