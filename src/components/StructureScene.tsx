import { useEffect, useRef, useState } from "react";
import { Atom } from "lucide-react";
import type { MoleculeRecord } from "../types/chemistry";
import { getPubChemSdfUrl } from "../lib/pubchem";
import { getSiteAssetUrl } from "../lib/urls";

interface StructureSceneProps {
  molecule: MoleculeRecord;
  compact?: boolean;
  spinning?: boolean;
}

export function StructureScene({ molecule, compact = false, spinning = true }: StructureSceneProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const spinningRef = useRef(spinning);
  const viewerRef = useRef<{
    clear: () => void;
    removeAllModels: () => void;
    addModel: (data: string, format: string) => void;
    setStyle: (selection: unknown, style: unknown) => void;
    zoomTo: () => void;
    render: () => void;
    spin: (flag?: boolean) => void;
    setBackgroundColor: (color: string, alpha?: number) => void;
  } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!rootRef.current || !molecule.pubchemCid) {
        setStatus("error");
        return;
      }

      try {
        setStatus("loading");

        const threeDmol = await import("3dmol");

        if (!viewerRef.current) {
          viewerRef.current = threeDmol.createViewer(rootRef.current, {
            backgroundColor: "rgba(0,0,0,0)"
          });
        }

        const localSnapshot = await fetch(getSiteAssetUrl(`data/pubchem/${molecule.id}.json`))
          .then((response) => (response.ok ? response.json() : null))
          .catch(() => null);

        let sdfText = typeof localSnapshot?.sdf === "string" ? localSnapshot.sdf : "";

        if (!sdfText) {
          const response3d = await fetch(getPubChemSdfUrl(molecule.pubchemCid, "3d"));
          const response = response3d.ok
            ? response3d
            : await fetch(getPubChemSdfUrl(molecule.pubchemCid, "2d"));

          if (!response.ok) {
            throw new Error(`structure fetch failed for ${molecule.name}`);
          }

          sdfText = await response.text();
        }

        if (cancelled || !viewerRef.current) {
          return;
        }

        viewerRef.current.clear();
        viewerRef.current.removeAllModels();
        viewerRef.current.addModel(sdfText, "sdf");
        viewerRef.current.setStyle(
          {},
          {
            stick: { radius: compact ? 0.14 : 0.18, colorscheme: "Jmol" },
            sphere: { scale: compact ? 0.26 : 0.32, colorscheme: "Jmol" }
          }
        );
        viewerRef.current.setBackgroundColor("#07131a", 0);
        viewerRef.current.zoomTo();
        viewerRef.current.spin(spinningRef.current);
        viewerRef.current.render();
        setStatus("ready");
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      viewerRef.current?.spin(false);
    };
  }, [compact, molecule.id, molecule.name, molecule.pubchemCid]);

  useEffect(() => {
    if (!viewerRef.current || status !== "ready") {
      return;
    }

    viewerRef.current.spin(spinning);
    viewerRef.current.render();
  }, [spinning, status]);

  return (
    <div className={compact ? "structure-scene compact" : "structure-scene"}>
      <div ref={rootRef} className="viewer-canvas" />
      {status !== "ready" ? (
        <div className="viewer-overlay">
          <Atom size={compact ? 18 : 22} />
          <p>
            {status === "loading"
              ? "Loading structure..."
              : "No render available for this molecule yet."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
