export type CefrLevel = "Pre-A1" | "A1" | "A2" | "B1" | "B2";

export const cefrLevelOrder: CefrLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2"];

export const primaryGradeCefrTargets: Record<string, CefrLevel> = {
  "Year 1": "Pre-A1",
  "Year 2": "Pre-A1",
  "Year 3": "A1",
  "Year 4": "A1",
  "Year 5": "A2",
  "Year 6": "A2",
};

export function getCefrTargetForGrade(schoolGrade: string): CefrLevel {
  return primaryGradeCefrTargets[schoolGrade] ?? "A1";
}

export function compareCefrLevel(current: CefrLevel, target: CefrLevel) {
  return cefrLevelOrder.indexOf(current) - cefrLevelOrder.indexOf(target);
}

export function getCefrLabel(level: CefrLevel) {
  const labels: Record<CefrLevel, string> = {
    "Pre-A1": "Starter English",
    A1: "Basic User",
    A2: "Elementary User",
    B1: "Independent Starter",
    B2: "Confident User",
  };

  return labels[level];
}
