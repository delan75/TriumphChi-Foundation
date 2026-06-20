import { useQuery } from '@tanstack/react-query';
import { apiGetDashboardSummary } from '../../lib/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: apiGetDashboardSummary,
    staleTime: 20_000,
  });
}
