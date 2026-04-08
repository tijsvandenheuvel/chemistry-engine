import { ArrowRight, Atom as AtomIcon, GitBranch } from "lucide-react";
import type { AtomRecord, MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { DisclosureSection } from "./DisclosureSection";
import { SourcesSection } from "./SourcesSection";
import { getReactionSourceEntries } from "../lib/sources";

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

  return (
    <section className="panel detail-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Reaction Dossier</p>
          <h2>{reaction.name}</h2>
        </div>
        <div className="count-chip">{molecules.length} linked molecules</div>
      </div>

      <p className="detail-intro">{reaction.summary}</p>

      <div className="stats-grid compact-stats-grid">
        <article className="stat-card">
          <span>Reactants</span>
          <strong>{reaction.reactants.length}</strong>
        </article>
        <article className="stat-card">
          <span>Products</span>
          <strong>{reaction.products.length}</strong>
        </article>
        <article className="stat-card">
          <span>Catalysts</span>
          <strong>{reaction.catalysts.length || "0"}</strong>
        </article>
        <article className="stat-card">
          <span>Steps</span>
          <strong>{reaction.steps.length}</strong>
        </article>
      </div>

      <div className="reaction-meta detail-reaction-meta">
        <span>Solvent: {reaction.solvent ?? "not specified"}</span>
        <span>Temperature: {reaction.temperature ?? "not specified"}</span>
        <span>Visual mode: modelled structural transition</span>
      </div>

      <div className="detail-stack">
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
          preview="Open the current notes and categorisation for this reaction."
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
