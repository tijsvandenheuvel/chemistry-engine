import { useMemo, useState } from "react";
import { ArrowRight, Atom as AtomIcon } from "lucide-react";
import type { AtomRecord, MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { AtomModelScene, type AtomVisualizationMode } from "./AtomModelScene";
import { estimateNeutronCount, getElectronShellOccupancy, getValenceElectronCount } from "../lib/atom-models";
import { DisclosureSection } from "./DisclosureSection";
import { SourcesSection } from "./SourcesSection";
import { getAtomSourceEntries } from "../lib/sources";
import { getAtomVerificationReport } from "../lib/verification";
import { VerificationSection } from "./VerificationSection";

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
  const [visualizationMode, setVisualizationMode] = useState<AtomVisualizationMode>("shell");
  const shellOccupancy = useMemo(() => getElectronShellOccupancy(atom.atomicNumber), [atom.atomicNumber]);
  const valenceElectrons = useMemo(() => getValenceElectronCount(atom.atomicNumber), [atom.atomicNumber]);
  const neutronEstimate = useMemo(
    () => estimateNeutronCount(atom.atomicWeight, atom.atomicNumber),
    [atom.atomicNumber, atom.atomicWeight]
  );
  const sourceEntries = useMemo(() => getAtomSourceEntries(atom), [atom]);
  const verificationReport = useMemo(() => getAtomVerificationReport(atom), [atom]);
  const oxidationStateLabel = atom.oxidationStates.length > 0 ? atom.oxidationStates.join(", ") : "reference pending";
  const electronConfigurationLabel =
    atom.electronConfiguration === "reference pending"
      ? "reference pending for this periodic-table record"
      : atom.electronConfiguration;

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
            <span>{atom.coverage === "curated" ? atom.symbol : `${atom.symbol} reference`}</span>
          </div>
        </div>

        <div className="atom-stage">
          <div className="atom-stage-head">
            <div className="reaction-switcher">
              {[
                { id: "shell", label: "Shell model" },
                { id: "valence", label: "Valence view" },
                { id: "periodic", label: "Periodic card" }
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={visualizationMode === mode.id ? "chip active" : "chip"}
                  onClick={() => setVisualizationMode(mode.id as AtomVisualizationMode)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="count-chip">modelled visualization</div>
          </div>

          <div className="atom-core atom-core-scene">
            <AtomModelScene atom={atom} mode={visualizationMode} />
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
            <article className="stat-card">
              <span>Valence electrons</span>
              <strong>{valenceElectrons}</strong>
            </article>
            <article className="stat-card">
              <span>Estimated neutrons</span>
              <strong>{neutronEstimate}</strong>
            </article>
          </div>
        </div>

        <div className="viewer-caption">
          <span>{electronConfigurationLabel}</span>
          <span>shells {shellOccupancy.join(" / ")}</span>
          <span>{oxidationStateLabel}</span>
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

        <div className="detail-stack">
          <DisclosureSection
            title="Electronic profile"
            count={4}
            preview="Open the electron configuration, shell model and oxidation-state summary."
          >
            <ul className="plain-list">
              <li>Electron configuration: {atom.electronConfiguration}</li>
              <li>Configuration status: {atom.coverage === "curated" ? "curated" : "periodic-table reference"}</li>
              <li>Modelled shell occupancy: {shellOccupancy.join(" / ")}</li>
              <li>Valence electrons: {valenceElectrons}</li>
              <li>Common oxidation states: {oxidationStateLabel}</li>
              <li>Category: {atom.category}</li>
            </ul>
          </DisclosureSection>

          <DisclosureSection
            title="Model notes"
            count={3}
            preview="Open the modelling notes that explain what is exact metadata and what is visual interpretation."
          >
            <ul className="plain-list">
              <li>Shell and valence views are modelled educational visualisations.</li>
              <li>Exact claims are limited here to atomic metadata and any explicitly curated electron configuration text.</li>
              <li>Estimated neutrons are derived from rounded atomic weight, not isotope-resolved data.</li>
            </ul>
          </DisclosureSection>

          <VerificationSection
            report={verificationReport}
            preview="Open the source comparison layer for this atom, including single-source fields and disagreements."
          />

          <DisclosureSection
            title="System context"
            count={3}
            preview="Open the current chemistry-graph coverage for this element."
          >
            <ul className="plain-list">
              <li>{relatedMolecules.length} molecules currently include this atom.</li>
              <li>{relatedReactions.length} reactions currently traverse molecules that contain this atom.</li>
              <li>Current atom data is limited to elements present in the loaded catalog.</li>
            </ul>
          </DisclosureSection>

          <SourcesSection
            entries={sourceEntries}
            preview="Open the atom reference list and external research entry points."
          />

          <DisclosureSection
            title="Linked molecules"
            count={relatedMolecules.length}
            preview="Open the molecule list that currently contains this element."
          >
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
          </DisclosureSection>

          <DisclosureSection
            title="Linked reactions"
            count={relatedReactions.length}
            preview="Open the reaction list that traverses molecules containing this atom."
          >
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
          </DisclosureSection>
        </div>
      </section>
    </>
  );
}
