import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGetDonation, apiListDonations, apiRefreshDonationPaymentStatus, type DonationListParams } from '../../lib/api';

export function useDonations(params: DonationListParams, enabled = true) {
  return useQuery({
    queryKey: ['staff-donations', params],
    queryFn: () => apiListDonations(params),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useDonation(uuid: string | null, enabled = true) {
  return useQuery({
    queryKey: ['staff-donation', uuid],
    queryFn: () => apiGetDonation(uuid as string),
    enabled: enabled && Boolean(uuid),
    staleTime: 1000 * 30,
  });
}

export function useRefreshDonationPaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiRefreshDonationPaymentStatus,
    onSuccess: (donation) => {
      queryClient.setQueryData(['staff-donation', donation.uuid], donation);
      void queryClient.invalidateQueries({ queryKey: ['staff-donations'] });
    },
  });
}
