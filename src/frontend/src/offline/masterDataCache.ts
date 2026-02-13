import { useQuery } from '@tanstack/react-query';
import { getMasterData } from './storage';

export function useMasterData(key: string) {
  return useQuery({
    queryKey: ['masterData', key],
    queryFn: async () => {
      const data = await getMasterData(key);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
