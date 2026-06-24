import { useQuery } from '@tanstack/react-query';
import { apiGetDonation, apiListDonations, type DonationListParams } from '../../lib/api';

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
