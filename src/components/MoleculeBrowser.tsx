import { useState } from "react";
import { Atom, ChevronDown, ChevronRight, FlaskConical, GitBranch, Search } from "lucide-react";
import type { AtomRecord, BrowserSection, MoleculeRecord, ReactionRecord } from "../types/chemistry";

interface MoleculeBrowserProps {
  activeSection: BrowserSection;
  sections: Array<{ id: BrowserSection; label: string; count: number }>;
  molecules: MoleculeRecord[];
  atoms: AtomRecord[];
  reactions: ReactionRecord[];
  selectedIds: Record<BrowserSection, string>;
  categories: string[];
  activeCategory: string;
  query: string;
  onSectionChange: (value: BrowserSection) => void;
  onCategoryChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onSelectMolecule: (moleculeId: string) => void;
  onSelectAtom: (atomId: string) => void;
  onSelectReaction: (reactionId: string) => void;
}

export function MoleculeBrowser({
  activeSection,
  sections,
  molecules,
  atoms,
  reactions,
  selectedIds,
  categories,
  activeCategory,
  query,
  onSectionChange,
  onCategoryChange,
  onQueryChange,
  onSelectMolecule,
  onSelectAtom,
  onSelectReaction
}: MoleculeBrowserProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<BrowserSection, boolean>>({
    molecules: false,
    atoms: false,
    reactions: false
  });
  const activeCount =
    activeSection === "atoms" ? atoms.length : activeSection === "reactions" ? reactions.length : molecules.length;
  const categoriesCollapsed = collapsedSections[activeSection];

  function toggleCategorySection(section: BrowserSection) {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  }

  return (
    <section className="panel browser-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Chemistry Browser</p>
          <h2>Catalogus</h2>
        </div>
        <div className="count-chip">{activeCount} hits</div>
      </div>

      <div className="browser-section-tabs" role="tablist" aria-label="Chemistry item types">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={section.id === activeSection ? "chip active browser-tab" : "chip browser-tab"}
            onClick={() => onSectionChange(section.id)}
          >
            <span>{section.label}</span>
            <strong>{section.count}</strong>
          </button>
        ))}
      </div>

      <label className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Zoek binnen ${activeSection}`}
        />
      </label>

      <button
        type="button"
        className="browser-category-head"
        onClick={() => toggleCategorySection(activeSection)}
        aria-expanded={!categoriesCollapsed}
      >
        <span className="browser-section-label">
          {activeSection === "molecules" ? "Molecule categories" : activeSection === "atoms" ? "Atom families" : "Reaction categories"}
        </span>
        <span className="browser-category-toggle">
          {categoriesCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          <small>{categoriesCollapsed ? "show" : "hide"}</small>
        </span>
      </button>

      <div className={categoriesCollapsed ? "category-strip collapsed" : "category-strip"}>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={category === activeCategory ? "chip active" : "chip"}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="browser-list-shell">
        <div className="molecule-list browser-list">
          {activeCount === 0 ? <div className="browser-empty">Geen items gevonden voor deze filters.</div> : null}

          {activeSection === "molecules"
            ? molecules.map((molecule) => (
                <button
                  key={molecule.id}
                  type="button"
                  className={molecule.id === selectedIds.molecules ? "molecule-card active" : "molecule-card"}
                  onClick={() => onSelectMolecule(molecule.id)}
                >
                  <div className="molecule-card-top">
                    <div className="browser-card-copy">
                      <strong>{molecule.name}</strong>
                      <p>{molecule.iupac}</p>
                    </div>
                    <FlaskConical size={16} />
                  </div>
                  <div className="molecule-metrics">
                    <span>{molecule.formula}</span>
                    <span>{molecule.molecularWeight.toFixed(2)} g/mol</span>
                  </div>
                  <div className="tag-row">
                    {molecule.categories.slice(0, 3).map((category) => (
                      <span key={category} className="tag">
                        {category}
                      </span>
                    ))}
                    {molecule.categories.length > 3 ? <span className="tag muted">+{molecule.categories.length - 3}</span> : null}
                  </div>
                </button>
              ))
            : null}

          {activeSection === "atoms"
            ? atoms.map((atom) => (
                <button
                  key={atom.id}
                  type="button"
                  className={atom.id === selectedIds.atoms ? "molecule-card active" : "molecule-card"}
                  onClick={() => onSelectAtom(atom.id)}
                >
                  <div className="molecule-card-top">
                    <div className="browser-card-copy">
                      <strong>
                        {atom.name} <span className="inline-symbol">({atom.symbol})</span>
                      </strong>
                      <p>{atom.description}</p>
                    </div>
                    <Atom size={16} />
                  </div>
                  <div className="molecule-metrics">
                    <span>Z {atom.atomicNumber}</span>
                    <span>{atom.atomicWeight.toFixed(3)} u</span>
                  </div>
                  <div className="tag-row">
                    <span className="tag">{atom.category}</span>
                    <span className="tag muted">period {atom.period}</span>
                    <span className="tag muted">group {atom.group}</span>
                  </div>
                </button>
              ))
            : null}

          {activeSection === "reactions"
            ? reactions.map((reaction) => (
                <button
                  key={reaction.id}
                  type="button"
                  className={reaction.id === selectedIds.reactions ? "molecule-card active" : "molecule-card"}
                  onClick={() => onSelectReaction(reaction.id)}
                >
                  <div className="molecule-card-top">
                    <div className="browser-card-copy">
                      <strong>{reaction.name}</strong>
                      <p>{reaction.summary}</p>
                    </div>
                    <GitBranch size={16} />
                  </div>
                  <div className="molecule-metrics">
                    <span>{reaction.reactants.length} reactants</span>
                    <span>{reaction.products.length} products</span>
                  </div>
                  <div className="tag-row">
                    {reaction.categories.slice(0, 3).map((category) => (
                      <span key={category} className="tag">
                        {category}
                      </span>
                    ))}
                    {reaction.categories.length > 3 ? <span className="tag muted">+{reaction.categories.length - 3}</span> : null}
                  </div>
                </button>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
