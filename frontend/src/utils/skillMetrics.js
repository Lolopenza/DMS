/**
 * Mirrors backend/dashboard mastery math (BKT prior + reliability dampening).
 */

export function clampPercent(value) {
  const normalized = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(normalized * 100)));
}

export function adjustedPknowForSkill(skill) {
  const pKnow = Number(skill?.pKnow) || 0;
  const attempts = Math.max(0, Number(skill?.totalAttempts) || 0);
  const reliability = Math.min(1, attempts / 8);
  const baseline = 0.25;
  return baseline + (pKnow - baseline) * reliability;
}

export function computeOverallPercent(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return 0;
  const weighted = skills.reduce(
    (acc, item) => {
      const attempts = Math.max(0, Number(item?.totalAttempts) || 0);
      const reliability = Math.min(1, attempts / 8);
      const baseline = 0.25;
      const pKnow = Number(item?.pKnow) || 0;
      const adjusted = baseline + (pKnow - baseline) * reliability;
      return {
        valueSum: acc.valueSum + adjusted * Math.max(1, attempts),
        weightSum: acc.weightSum + Math.max(1, attempts),
      };
    },
    { valueSum: 0, weightSum: 0 },
  );
  return clampPercent(weighted.weightSum ? weighted.valueSum / weighted.weightSum : 0);
}

export function computeTotalAttempts(skills) {
  if (!Array.isArray(skills)) return 0;
  return skills.reduce((sum, s) => sum + Math.max(0, Number(s?.totalAttempts) || 0), 0);
}

export function masteryTier(overallPercent) {
  if (overallPercent < 20) return 'beginner';
  if (overallPercent < 70) return 'active';
  return 'master';
}
