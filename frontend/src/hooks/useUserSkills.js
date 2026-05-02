import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserSkills } from '../api.js';
import {
  computeOverallPercent,
  computeTotalAttempts,
  masteryTier,
} from '../utils/skillMetrics.js';

export default function useUserSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserSkills();
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load mastery data');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const overallPercent = useMemo(() => computeOverallPercent(skills), [skills]);
  const totalAttempts = useMemo(() => computeTotalAttempts(skills), [skills]);
  const tier = useMemo(() => masteryTier(overallPercent), [overallPercent]);

  return {
    skills,
    loading,
    error,
    reload,
    overallPercent,
    totalAttempts,
    tier,
  };
}
