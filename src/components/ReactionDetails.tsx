import { useMemo, useState } from "react";
import { ArrowRight, Atom as AtomIcon, Download, GitBranch, Orbit, ShieldAlert, Sparkles } from "lucide-react";
import type { AtomRecord, MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { DisclosureSection } from "./DisclosureSection";
import { SourcesSection } from "./SourcesSection";
import { getReactionSourceEntries } from "../lib/sources";
import {
  buildReactionSafetyRecord,
  downloadReactionSafetySheetPdf,
  fetchMoleculeSafetyRecords
} from "../lib/safety";
import { useMoleculeSafetyMap } from "../hooks/useSafety";
import { getReactionVerificationReport } from "../lib/verification";
import { VerificationSection } from "./VerificationSection";

interface ReactionDetailsProps {
  reaction: ReactionRecord;
  molecules: MoleculeRecord[];
  atoms: AtomRecord[];
  onSelectMolecule: (moleculeId: string) => void;
  onSelectAtom: (atomId: string) => void;
}

export function ReactionDetails({
  reaction,
  molecules,
  atoms,
  onSelectMolecule,
  onSelectAtom
}: ReactionDetailsProps) {
  const sourceEntries = getReactionSourceEntries(reaction);
  const { recordMap: participantSafetyMap, loading: loadingParticipantSafety } = useMoleculeSafetyMap(molecules);
  const reactionSafety = useMemo(
    () => buildReactionSafetyRecord(reaction, molecules, participantSafetyMap),
    [molecules, participantSafetyMap, reaction]
  );
  const verificationReport = useMemo(
    () => getReactionVerificationReport(reaction, molecules),
    [molecules, reaction]
  );
  const [downloadingSafety, setDownloadingSafety] = useState(false);

  async function handleDownloadReactionSafety() {
    setDownloadingSafety(true);

    try {
      const safetyRecords = await fetchMoleculeSafetyRecords(molecules);
      const freshReactionSafety = buildReactionSafetyRecord(reaction, molecules, safetyRecords);
      downloadReactionSafetySheetPdf(reaction, molecules, freshReactionSafety, safetyRecords);
    } finally {
      setDownloadingSafety(false);
    }
  }

  return (
    <section className="panel detail-panel reaction-dossier-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Reaction Dossier</p>
          <h2>Expanded reference layer</h2>
        </div>
        <div className="count-chip">{molecules.length + atoms.length} linked records</div>
      </div>

      <p className="detail-intro">
        De reaction page zelf blijft nu rustiger. Deze dossierlaag bewaart de bredere context,
        linked entities, modelling notes en source-links.
      </p>

      <div className="detail-stack">
        <DisclosureSection
          title="Record summary"
          count={4}
          defaultOpen
          preview="Open the compact chemistry and playback summary for this reaction."
        >
          <div className="reaction-dossier-grid">
            <article className="subpanel">
              <div className="subpanel-head">
                <h3>Core chemistry</h3>
                <AtomIcon size={16} />
              </div>
              <div className="reaction-dossier-list">
                <div>
                  <span>Primary family</span>
                  <strong>{reaction.categories[0] ?? "reaction"}</strong>
                </div>
                <div>
                  <span>Reactants / products</span>
                  <strong>
                    {reaction.reactants.length} / {reaction.products.length}
                  </strong>
                </div>
                <div>
                  <span>Conditions</span>
                  <strong>{reaction.temperature ?? "not specified"}</strong>
                </div>
              </div>
            </article>

            <article className="subpanel">
              <div className="subpanel-head">
                <h3>Playback status</h3>
                <Sparkles size={16} />
              </div>
              <div className="reaction-dossier-list">
                <div>
                  <span>Visual mode</span>
                  <strong>Modelled structural transition</strong>
                </div>
                <div>
                  <span>Step count</span>
                  <strong>{reaction.steps.length}</strong>
                </div>
                <div>
                  <span>Simulation readiness</span>
                  <strong>Future layer</strong>
                </div>
              </div>
            </article>
          </div>
        </DisclosureSection>

        <VerificationSection
          report={verificationReport}
          preview="Cross-check reaction consistency, participant coverage and unresolved disagreements without crowding the main explorer."
        />

        <DisclosureSection
          title="Safety sheet"
          count={
            reactionSafety.primaryHazards.length +
            reactionSafety.controls.length +
            reactionSafety.ppe.length +
            reactionSafety.participants.length
          }
          preview="Participant GHS, process watchpoints and PDF export stay tucked away in one safety layer."
        >
          <div className="safety-sheet">
            <div className="safety-toolbar">
              <div className="tag-row">
                <span className={reactionSafety.status === "participant-derived" ? "availability availability-open" : "availability availability-neutral"}>
                  {reactionSafety.status === "participant-derived" ? "participant-derived" : "modelled process"}
                </span>
                <span className="count-chip">
                  {reactionSafety.participantCoverage.sourceBacked}/{reactionSafety.participantCoverage.total} source-backed
                </span>
                {loadingParticipantSafety ? <span className="availability availability-neutral">syncing participants</span> : null}
              </div>

              <button
                type="button"
                className="chip safety-download-button"
                onClick={handleDownloadReactionSafety}
                disabled={downloadingSafety}
              >
                <Download size={14} />
                <span>{downloadingSafety ? "Building PDF..." : "Download reaction PDF"}</span>
              </button>
            </div>

            <article className="subpanel safety-summary-panel">
              <div className="subpanel-head">
                <h3>Reaction safety overview</h3>
                <ShieldAlert size={16} />
              </div>
              <p className="detail-intro compact-intro">{reactionSafety.summary}</p>
              <p className="safety-note">{reactionSafety.note}</p>
            </article>

            <div className="safety-grid reaction-safety-grid">
              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Primary hazards</h3>
                  <span className="count-chip">{reactionSafety.primaryHazards.length}</span>
                </div>
                <ul className="plain-list">
                  {reactionSafety.primaryHazards.map((hazard) => (
                    <li key={hazard}>{hazard}</li>
                  ))}
                </ul>
              </article>

              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Controls</h3>
                  <span className="count-chip">{reactionSafety.controls.length}</span>
                </div>
                <ul className="plain-list">
                  {reactionSafety.controls.map((control) => (
                    <li key={control}>{control}</li>
                  ))}
                </ul>
              </article>

              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>PPE</h3>
                  <span className="count-chip">{reactionSafety.ppe.length}</span>
                </div>
                <ul className="plain-list">
                  {reactionSafety.ppe.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className="subpanel">
                <div className="subpanel-head">
                  <h3>Watchpoints</h3>
                  <span className="count-chip">{reactionSafety.watchpoints.length}</span>
                </div>
                <ul className="plain-list">
                  {reactionSafety.watchpoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="subpanel">
              <div className="subpanel-head">
                <h3>Participant hazard phrases</h3>
                <span className="count-chip">{reactionSafety.participants.length}</span>
              </div>

              <div className="safety-participant-grid">
                {reactionSafety.participants.map((participant) => (
                  <button
                    key={participant.moleculeId}
                    type="button"
                    className="safety-participant-card"
                    onClick={() => onSelectMolecule(participant.moleculeId)}
                  >
                    <div className="safety-participant-head">
                      <div>
                        <strong>{participant.moleculeName}</strong>
                        <p>
                          {participant.signalWord ?? "No signal word synced"} · {participant.status}
                        </p>
                      </div>
                      <ArrowRight size={14} />
                    </div>

                    {participant.pictograms.length > 0 ? (
                      <div className="safety-participant-pictograms">
                        {participant.pictograms.map((pictogram) => (
                          <img key={`${participant.moleculeId}-${pictogram.code}`} src={pictogram.url} alt={pictogram.label} />
                        ))}
                      </div>
                    ) : null}

                    <div className="safety-participant-lines">
                      {participant.hazardStatements.length > 0 ? (
                        participant.hazardStatements.map((statement) => (
                          <span key={`${participant.moleculeId}-${statement.code}`} className="tag muted">
                            {statement.code}
                          </span>
                        ))
                      ) : (
                        <span className="tag muted">No H statements</span>
                      )}
                    </div>

                    <div className="safety-participant-copy">
                      {participant.hazardStatements.length > 0 ? (
                        participant.hazardStatements.map((statement) => (
                          <p key={`${participant.moleculeId}-${statement.code}-text`}>
                            <strong>{statement.code}</strong> {statement.text}
                          </p>
                        ))
                      ) : (
                        <p>Open the molecule dossier to review the current compound-level safety summary.</p>
                      )}

                      {participant.precautionaryStatements.length > 0 ? (
                        participant.precautionaryStatements.map((statement) => (
                          <p key={`${participant.moleculeId}-${statement.code}-p`}>
                            <strong>{statement.code}</strong> {statement.text}
                          </p>
                        ))
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </article>
          </div>
        </DisclosureSection>

        <DisclosureSection
          title="Reaction participants"
          count={molecules.length}
          preview="Open the full reactant and product list for quick navigation."
        >
          <div className="browser-link-list">
            {molecules.map((molecule) => {
              const role =
                reaction.reactants.includes(molecule.id) && reaction.products.includes(molecule.id)
                  ? "reactant / product"
                  : reaction.reactants.includes(molecule.id)
                    ? "reactant"
                    : "product";

              return (
                <button
                  key={molecule.id}
                  type="button"
                  className="browser-link-card"
                  onClick={() => onSelectMolecule(molecule.id)}
                >
                  <div>
                    <strong>{molecule.name}</strong>
                    <p>
                      {molecule.formula} · {role}
                    </p>
                  </div>
                  <ArrowRight size={14} />
                </button>
              );
            })}
          </div>
        </DisclosureSection>

        <DisclosureSection
          title="Involved atoms"
          count={atoms.length}
          preview="Open the linked atom list to jump from reaction context into element context."
        >
          <div className="tag-row disclosure-tag-row">
            {atoms.map((atom) => (
              <button
                key={atom.id}
                type="button"
                className="chip"
                onClick={() => onSelectAtom(atom.id)}
              >
                {atom.symbol} · {atom.name}
              </button>
            ))}
          </div>
        </DisclosureSection>

        <DisclosureSection
          title="Process notes"
          count={reaction.categories.length + 1}
          preview="Open modelling notes, categories and forward-looking theatre context."
        >
          <div className="detail-columns single-column">
            <article className="subpanel">
              <div className="subpanel-head">
                <h3>Reaction notes</h3>
                <GitBranch size={16} />
              </div>
              <p className="detail-intro compact-intro">{reaction.notes}</p>
            </article>

            <article className="subpanel">
              <div className="subpanel-head">
                <h3>Categories</h3>
                <AtomIcon size={16} />
              </div>
              <div className="tag-row">
                {reaction.categories.map((category) => (
                  <span key={category} className="tag">
                    {category}
                  </span>
                ))}
              </div>
            </article>

            <article className="subpanel">
              <div className="subpanel-head">
                <h3>Theatre roadmap</h3>
                <Orbit size={16} />
              </div>
              <ul className="plain-list">
                <li>Current playback is a modelled 3D / 2D transition layer for clarity and browsing.</li>
                <li>Next maturity step is provenance-aware reaction facts with better structured conditions.</li>
                <li>Later phases can add atom mapping, simulation logic and richer mechanistic playback.</li>
              </ul>
            </article>
          </div>
        </DisclosureSection>

        <SourcesSection
          entries={sourceEntries}
          preview="Combined source links and external reaction references stay closed by default."
        />
      </div>
    </section>
  );
}
