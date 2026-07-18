import { useMutation } from '@tanstack/react-query';
import { scanApi } from '@/lib/api';

export function useScan() {
  return useMutation({
    mutationFn: scanApi.scan,
    retry: 0,
  });
}
