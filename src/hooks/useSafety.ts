import { startTransition, useEffect, useMemo, useState } from "react";
import type { MoleculeRecord, MoleculeSafetyRecord } from "../types/chemistry";
import { fetchMoleculeSafetyRecord, getFallbackMoleculeSafetyRecord } from "../lib/safety";

interface MoleculeSafetyState {
  record: MoleculeSafetyRecord;
  loading: boolean;
}

export function useMoleculeSafety(molecule: MoleculeRecord): MoleculeSafetyState {
  const fallback = useMemo(() => getFallbackMoleculeSafetyRecord(molecule), [molecule]);
  const [record, setRecord] = useState<MoleculeSafetyRecord>(fallback);
  const [loading, setLoading] = useState(Boolean(molecule.pubchemCid));

  useEffect(() => {
    let cancelled = false;

    setRecord(fallback);
    setLoading(Boolean(molecule.pubchemCid));

    if (!molecule.pubchemCid) {
      return () => {
        cancelled = true;
      };
    }

    fetchMoleculeSafetyRecord(molecule)
      .then((nextRecord) => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setRecord(nextRecord);
          setLoading(false);
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setRecord(fallback);
          setLoading(false);
        });
      });

    return () => {
      cancelled = true;
    };
  }, [fallback, molecule]);

  return { record, loading };
}

export function useMoleculeSafetyMap(molecules: MoleculeRecord[]) {
  const [recordMap, setRecordMap] = useState<Record<string, MoleculeSafetyRecord>>(() =>
    Object.fromEntries(molecules.map((molecule) => [molecule.id, getFallbackMoleculeSafetyRecord(molecule)]))
  );
  const [loadingCount, setLoadingCount] = useState(0);
  const moleculeKey = useMemo(() => molecules.map((molecule) => molecule.id).join("|"), [molecules]);

  useEffect(() => {
    let cancelled = false;
    const baseMap = Object.fromEntries(
      molecules.map((molecule) => [molecule.id, getFallbackMoleculeSafetyRecord(molecule)])
    ) as Record<string, MoleculeSafetyRecord>;
    const pending = molecules.filter((molecule) => molecule.pubchemCid).length;

    setRecordMap(baseMap);
    setLoadingCount(pending);

    if (pending === 0) {
      return () => {
        cancelled = true;
      };
    }

    molecules.forEach((molecule) => {
      if (!molecule.pubchemCid) {
        return;
      }

      fetchMoleculeSafetyRecord(molecule)
        .then((record) => {
          if (cancelled) {
            return;
          }

          startTransition(() => {
            setRecordMap((current) => ({ ...current, [molecule.id]: record }));
            setLoadingCount((current) => Math.max(0, current - 1));
          });
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          startTransition(() => {
            setLoadingCount((current) => Math.max(0, current - 1));
          });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [moleculeKey, molecules]);

  return {
    recordMap,
    loading: loadingCount > 0
  };
}
