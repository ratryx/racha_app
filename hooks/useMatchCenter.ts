'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { FutsalSessionDetails } from '@/types';
import { getFutsalSessions } from '@/lib/supabase/matchCenter';

export function useMatchCenter(groupId: string | null) {
  const [sessions, setSessions] = useState<FutsalSessionDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!groupId) {
      setSessions([]);
      setErrorMessage('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const nextSessions = await getFutsalSessions(groupId);

      if (requestIdRef.current !== requestId) return;
      setSessions(nextSessions);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as partidas.'
      );
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void reload();

    return () => {
      requestIdRef.current += 1;
    };
  }, [reload]);

  return {
    sessions,
    loading,
    errorMessage,
    reload,
  };
}
