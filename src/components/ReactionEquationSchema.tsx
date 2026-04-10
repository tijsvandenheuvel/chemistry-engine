import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { getFormulaAtoms } from "../lib/reaction-visuals";
import { StructureScene } from "./StructureScene";

interface ReactionEquationSchemaProps {
  reaction: ReactionRecord;
  molecules: Map<string, MoleculeRecord>;
  selectedMoleculeId?: string | null;
  onSelectMolecule?: (moleculeId: string) => void;
}

function MoleculeEquationCard({
  molecule,
  role,
  renderMode,
  selected,
  onSelect
}: {
  molecule: MoleculeRecord;
  role: string;
  renderMode: "2d" | "3d";
  selected: boolean;
  onSelect?: (moleculeId: string) => void;
}) {
  const atoms = getFormulaAtoms(molecule.formula);

  return (
    <button
      type="button"
      className={selected ? "equation-species-card selected" : "equation-species-card"}
      onClick={() => onSelect?.(molecule.id)}
    >
      <div className="equation-species-card-top">
        <span className="reaction-overview-label">{role}</span>
        <strong>{molecule.name}</strong>
      </div>

      {renderMode === "3d" ? (
        <div className="equation-species-3d">
          <StructureScene molecule={molecule} compact spinning={false} />
        </div>
      ) : (
        <div className="equation-species-2d">
          <div className="equation-atom-row">
            {atoms.map((atom) => (
              <div key={atom.symbol} className="equation-atom-chip">
                <strong>{atom.symbol}</strong>
                <span>{atom.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="equation-species-meta">
        <span>{molecule.formula}</span>
        <small>{molecule.iupac}</small>
      </div>
    </button>
  );
}

export function ReactionEquationSchema({
  reaction,
  molecules,
  selectedMoleculeId,
  onSelectMolecule
}: ReactionEquationSchemaProps) {
  const [renderMode, setRenderMode] = useState<"2d" | "3d">("2d");

  useEffect(() => {
    setRenderMode("2d");
  }, [reaction.id]);

  return (
    <article className="reaction-overview-card reaction-overview-equation">
      <div className="reaction-overview-head">
        <div>
          <span className="reaction-overview-label">Reaction equation</span>
          <strong>Schema view</strong>
        </div>

        <div className="reaction-view-toggle compact">
          <button
            type="button"
            className={renderMode === "2d" ? "chip active" : "chip"}
            onClick={() => setRenderMode("2d")}
          >
            2D atoms
          </button>
          <button
            type="button"
            className={renderMode === "3d" ? "chip active" : "chip"}
            onClick={() => setRenderMode("3d")}
          >
            3D models
          </button>
        </div>
      </div>

      <div className="reaction-equation-schema">
        <div className="reaction-equation-lane">
          {reaction.reactants.map((reactantId) => {
            const molecule = molecules.get(reactantId);
            return molecule ? (
              <MoleculeEquationCard
                key={reactantId}
                molecule={molecule}
                role="reactant"
                renderMode={renderMode}
                selected={selectedMoleculeId === reactantId}
                onSelect={onSelectMolecule}
              />
            ) : null;
          })}
        </div>

        <div className="reaction-equation-arrow">
          <ArrowRight size={18} />
        </div>

        <div className="reaction-equation-lane products">
          {reaction.products.map((productId) => {
            const molecule = molecules.get(productId);
            return molecule ? (
              <MoleculeEquationCard
                key={productId}
                molecule={molecule}
                role="product"
                renderMode={renderMode}
                selected={selectedMoleculeId === productId}
                onSelect={onSelectMolecule}
              />
            ) : null;
          })}
        </div>
      </div>
    </article>
  );
}
