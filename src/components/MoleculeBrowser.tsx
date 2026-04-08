import { FlaskConical, Search } from "lucide-react";
import type { MoleculeRecord } from "../types/chemistry";

interface MoleculeBrowserProps {
  molecules: MoleculeRecord[];
  selectedId: string;
  categories: string[];
  activeCategory: string;
  query: string;
  onCategoryChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onSelect: (moleculeId: string) => void;
}

export function MoleculeBrowser({
  molecules,
  selectedId,
  categories,
  activeCategory,
  query,
  onCategoryChange,
  onQueryChange,
  onSelect
}: MoleculeBrowserProps) {
  return (
    <section className="panel browser-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Molecule Browser</p>
          <h2>Catalogus</h2>
        </div>
        <div className="count-chip">{molecules.length} hits</div>
      </div>

      <label className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Zoek op naam, formule, SMILES of use case"
        />
      </label>

      <div className="category-strip">
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

      <div className="molecule-list">
        {molecules.map((molecule) => (
          <button
            key={molecule.id}
            type="button"
            className={molecule.id === selectedId ? "molecule-card active" : "molecule-card"}
            onClick={() => onSelect(molecule.id)}
          >
            <div className="molecule-card-top">
              <div>
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
              {molecule.categories.map((category) => (
                <span key={category} className="tag">
                  {category}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
