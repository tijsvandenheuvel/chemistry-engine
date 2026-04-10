import { startTransition, useEffect, useMemo, useState } from "react";
import type { MoleculeRecord, VerificationReport } from "../types/chemistry";
import { fetchMoleculeVerificationReport } from "../lib/verification";

function createPendingReport(molecule: MoleculeRecord): VerificationReport {
  return {
    kind: "molecule",
    overallStatus: molecule.pubchemCid ? "pending" : "single-source",
    summary: molecule.pubchemCid
      ? "Cross-source verification is loading for this molecule."
      : "This molecule currently has only one linked source in the app.",
    sources: [
      {
        id: "catalog",
        label: "Catalog snapshot",
        detail: "Locally generated molecule record used by the app.",
        state: "checked"
      },
      ...(molecule.pubchemCid
        ? [
            {
              id: "pubchem-live",
              label: "PubChem live properties",
              detail: "Live external verification target for core molecular descriptors.",
              state: "pending" as const
            }
          ]
        : [])
    ],
    fields: [],
    notes: [],
    counts: {
      verified: 0,
      conflict: 0,
      singleSource: molecule.pubchemCid ? 0 : 1,
      pending: molecule.pubchemCid ? 1 : 0,
      modelled: 0
    }
  };
}

export function useMoleculeVerification(molecule: MoleculeRecord) {
  const pendingReport = useMemo(() => createPendingReport(molecule), [molecule]);
  const [report, setReport] = useState<VerificationReport>(pendingReport);
  const [loading, setLoading] = useState(Boolean(molecule.pubchemCid));

  useEffect(() => {
    let cancelled = false;

    setReport(pendingReport);
    setLoading(Boolean(molecule.pubchemCid));

    fetchMoleculeVerificationReport(molecule)
      .then((nextReport) => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setReport(nextReport);
          setLoading(false);
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setReport(pendingReport);
          setLoading(false);
        });
      });

    return () => {
      cancelled = true;
    };
  }, [molecule, pendingReport]);

  return {
    report,
    loading
  };
}
