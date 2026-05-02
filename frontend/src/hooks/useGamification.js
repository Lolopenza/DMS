import { useEffect, useState } from 'react';
import { getGamificationSummary } from '../api.js';

const DEFAULT_DAILY_TARGET = Number(import.meta.env.VITE_GAMIFICATION_DAILY_GOAL_TARGET) || 5;

function emptySummary() {
  return {
    streakDays: 0,
    streakActive: false,
    dailyGoal: { current: 0, target: DEFAULT_DAILY_TARGET },
    recentAchievements: [],
    allAchievements: [],
  };
}

/**
 * Loads gamification summary for the signed-in user. On error, returns safe defaults
 * (zero streak, empty achievements) so the UI never breaks.
 */
export default function useGamification() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getGamificationSummary();
        if (!cancelled) {
          setData({
            streakDays: res?.streakDays ?? 0,
            streakActive: Boolean(res?.streakActive),
            dailyGoal: {
              current: res?.dailyGoal?.current ?? 0,
              target: Math.max(1, res?.dailyGoal?.target ?? DEFAULT_DAILY_TARGET),
            },
            recentAchievements: Array.isArray(res?.recentAchievements) ? res.recentAchievements : [],
            allAchievements: Array.isArray(res?.allAchievements) ? res.allAchievements : [],
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Could not load gamification');
          setData(emptySummary());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const merged = data ?? emptySummary();
  return {
    ...merged,
    loading,
    error,
    defaultsTarget: DEFAULT_DAILY_TARGET,
  };
}
