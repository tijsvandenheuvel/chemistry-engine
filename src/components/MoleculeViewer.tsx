import { useEffect, useState } from "react";
import { Pause, Play, Orbit } from "lucide-react";
import type { MoleculeRecord } from "../types/chemistry";
import { StructureScene } from "./StructureScene";

interface ViewerProps {
  molecule: MoleculeRecord;
}

export function MoleculeViewer({ molecule }: ViewerProps) {
  const [rotating, setRotating] = useState(true);

  useEffect(() => {
    setRotating(true);
  }, [molecule.id]);

  return (
    <section className="panel viewer-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">3D Render</p>
          <h2>{molecule.name}</h2>
        </div>
        <div className="viewer-toolbar">
          <div className="viewer-status">
            <Orbit size={16} />
            <span>{rotating ? "rotating model" : "rotation paused"}</span>
          </div>
          <button
            type="button"
            className={rotating ? "chip active" : "chip"}
            onClick={() => setRotating((current) => !current)}
          >
            {rotating ? <Pause size={14} /> : <Play size={14} />}
            <span>{rotating ? "Stop rotation" : "Rotate model"}</span>
          </button>
        </div>
      </div>

      <div className="viewer-shell">
        <StructureScene molecule={molecule} spinning={rotating} />
      </div>

      <div className="viewer-caption">
        <span>{molecule.formula}</span>
        <span>{molecule.smiles}</span>
      </div>
    </section>
  );
}
