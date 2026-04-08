import { Orbit } from "lucide-react";
import type { MoleculeRecord } from "../types/chemistry";
import { StructureScene } from "./StructureScene";

interface ViewerProps {
  molecule: MoleculeRecord;
}

export function MoleculeViewer({ molecule }: ViewerProps) {
  return (
    <section className="panel viewer-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">3D Render</p>
          <h2>{molecule.name}</h2>
        </div>
        <div className="viewer-status">
          <Orbit size={16} />
          <span>rotating model</span>
        </div>
      </div>

      <div className="viewer-shell">
        <StructureScene molecule={molecule} />
      </div>

      <div className="viewer-caption">
        <span>{molecule.formula}</span>
        <span>{molecule.smiles}</span>
      </div>
    </section>
  );
}
