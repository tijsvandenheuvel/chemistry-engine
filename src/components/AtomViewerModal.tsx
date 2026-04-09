import { useEffect } from "react";
import { X } from "lucide-react";
import type { AtomRecord, MoleculeRecord, ReactionRecord } from "../types/chemistry";
import { AtomPanel } from "./AtomPanel";

interface AtomViewerModalProps {
  atom: AtomRecord;
  relatedMolecules: MoleculeRecord[];
  relatedReactions: ReactionRecord[];
  onSelectMolecule: (moleculeId: string) => void;
  onSelectReaction: (reactionId: string) => void;
  onClose: () => void;
}

export function AtomViewerModal({
  atom,
  relatedMolecules,
  relatedReactions,
  onSelectMolecule,
  onSelectReaction,
  onClose
}: AtomViewerModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="atom-modal-overlay" role="dialog" aria-modal="true" aria-label={`${atom.name} atom viewer`}>
      <button type="button" className="atom-modal-backdrop" aria-label="Close atom viewer" onClick={onClose} />

      <div className="atom-modal-shell">
        <div className="atom-modal-header">
          <div>
            <p className="eyebrow">Atom Viewer</p>
            <h2>{atom.name}</h2>
          </div>
          <button type="button" className="chip atom-modal-close" onClick={onClose}>
            <X size={14} />
            <span>Close</span>
          </button>
        </div>

        <AtomPanel
          atom={atom}
          relatedMolecules={relatedMolecules}
          relatedReactions={relatedReactions}
          onSelectMolecule={onSelectMolecule}
          onSelectReaction={onSelectReaction}
        />
      </div>
    </div>
  );
}
