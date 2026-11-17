/** "★★★★☆ (4/5)" */
export function formatStars(stars: number, max = 5): string {
  const n = Math.max(0, Math.min(max, Math.round(stars)));
  return `${"★".repeat(n)}${"☆".repeat(max - n)} (${n}/${max})`;
}

/** Number of driver-assist systems fitted, out of the four we track. */
export function adasCount(r: {
  automaticEmergencyBrake: boolean;
  laneKeepAssist: boolean;
  blindSpotMonitor: boolean;
  adaptiveCruise: boolean;
}): number {
  return [r.automaticEmergencyBrake, r.laneKeepAssist, r.blindSpotMonitor, r.adaptiveCruise].filter(Boolean).length;
}
