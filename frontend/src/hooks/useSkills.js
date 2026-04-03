import { useState, useEffect } from 'react';
import api from '../config/api';

// Module-level cache — shared across all components, survives re-renders and navigations
let cachedSkills = null;
let fetchPromise = null;

/**
 * Custom hook for fetching and caching the global skills list.
 * Uses a singleton cache so the API is called at most once per session.
 *
 * Returns:
 *   skills        — raw array of { _id, name, category }
 *   skillOptions  — formatted for Ant Design Select: [{ label, value }]
 *   skillsByCategory — grouped: { Frontend: [...], Backend: [...] }
 *   loading       — true while the initial fetch is in flight
 */
export default function useSkills() {
  const [skills, setSkills] = useState(cachedSkills || []);
  const [loading, setLoading] = useState(!cachedSkills);

  useEffect(() => {
    // Already cached — nothing to do
    if (cachedSkills) {
      setSkills(cachedSkills);
      setLoading(false);
      return;
    }

    // Deduplicate concurrent fetches (e.g. two components mount at the same time)
    if (!fetchPromise) {
      fetchPromise = api.get('/skills')
        .then(res => {
          cachedSkills = res.data;
          return cachedSkills;
        })
        .catch(err => {
          console.error('Failed to fetch skills:', err);
          return [];
        })
        .finally(() => {
          fetchPromise = null;
        });
    }

    fetchPromise.then(data => {
      setSkills(data);
      setLoading(false);
    });
  }, []);

  // Pre-formatted for Ant Design <Select> components
  const skillOptions = skills.map(s => ({ label: s.name, value: s.name }));

  // Grouped by category for advanced UIs
  const skillsByCategory = skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return { skills, skillOptions, skillsByCategory, loading };
}

/**
 * Call this after creating a project with new skills to refresh the cache.
 */
export function invalidateSkillsCache() {
  cachedSkills = null;
}
