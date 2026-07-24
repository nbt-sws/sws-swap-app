import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { scanApi } from '@/lib/api';

export function useScan() {
  // In-flight identify request — aborted when the user cancels from the
  // blocking progress overlay.
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: (data: { image: string; tcg: string; lang: string; force?: boolean }) => {
      const controller = new AbortController();
      abortRef.current = controller;
      return scanApi.scan(data, controller.signal).finally(() => {
        if (abortRef.current === controller) abortRef.current = null;
      });
    },
    retry: 0,
  });

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { ...mutation, cancel };
}
