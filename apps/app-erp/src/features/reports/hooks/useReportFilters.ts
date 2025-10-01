import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReportFilters } from '../components/FilterBar';

const STORAGE_KEY_PREFIX = 'reportFilters:';

function parseQuery(search: string): Partial<ReportFilters> {
  const p = new URLSearchParams(search);
  return {
    search: p.get('q') || '',
    from: p.get('from') || '',
    to: p.get('to') || '',
    groupBy: (p.get('g') as ReportFilters['groupBy']) || undefined,
  };
}

function toQuery(f: ReportFilters) {
  const p = new URLSearchParams();
  if (f.search) p.set('q', f.search);
  if (f.from) p.set('from', f.from);
  if (f.to) p.set('to', f.to);
  if (f.groupBy) p.set('g', f.groupBy);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function useReportFilters(scope: string, defaults: ReportFilters) {
  const navigate = useNavigate();
  const location = useLocation();
  const storageKey = STORAGE_KEY_PREFIX + scope;

  const [filters, setFilters] = useState<ReportFilters>(() => {
    const saved = localStorage.getItem(storageKey);
    const parsedSaved: Partial<ReportFilters> = saved ? JSON.parse(saved) : {};
    const q = parseQuery(location.search);
    return { ...defaults, ...parsedSaved, ...q } as ReportFilters;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, storageKey]);

  useEffect(() => {
    // Sin loops: si query difiere actualizamos, caso contrario no.
    const q = parseQuery(location.search);
    const currentQuery = toQuery(filters);
    const targetQuery = toQuery({ ...filters, ...q });
    if (currentQuery !== targetQuery) {
      navigate({ pathname: location.pathname, search: currentQuery }, { replace: true });
    }
  }, [filters, location.pathname, location.search, navigate]);

  const update = useCallback((next: Partial<ReportFilters>) => {
    setFilters((f) => ({ ...f, ...next }));
  }, []);

  const api = useMemo(() => ({ filters, setFilters: update }), [filters, update]);
  return api;
}
