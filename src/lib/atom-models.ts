const shellCapacities = [2, 8, 18, 32, 32, 18, 8];

export function getElectronShellOccupancy(atomicNumber: number) {
  let remaining = atomicNumber;
  const shells: number[] = [];

  for (const capacity of shellCapacities) {
    if (remaining <= 0) {
      break;
    }

    const electronsInShell = Math.min(remaining, capacity);
    shells.push(electronsInShell);
    remaining -= electronsInShell;
  }

  return shells;
}

export function getValenceElectronCount(atomicNumber: number) {
  const shells = getElectronShellOccupancy(atomicNumber);
  return shells[shells.length - 1] ?? atomicNumber;
}

export function estimateNeutronCount(atomicWeight: number, atomicNumber: number) {
  return Math.max(Math.round(atomicWeight) - atomicNumber, 0);
}
