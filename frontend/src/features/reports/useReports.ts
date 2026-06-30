import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGenerateReport, apiGetReportDashboard, apiGetReportQueue, type ReportGeneratePayload } from '../../lib/api';

export function useReportDashboard(enabled: boolean) {
  return useQuery({
    queryKey: ['reports-dashboard'],
    queryFn: apiGetReportDashboard,
    enabled,
    staleTime: 45_000,
  });
}

export function useReportQueue(enabled: boolean) {
  return useQuery({
    queryKey: ['reports-queue'],
    queryFn: apiGetReportQueue,
    enabled,
    refetchInterval: enabled ? 15_000 : false,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReportGeneratePayload) => apiGenerateReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports-queue'] });
    },
  });
}
