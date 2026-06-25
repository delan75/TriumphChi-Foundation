import { useQuery } from '@tanstack/react-query';
import { apiGetBeneficiary, apiListBeneficiaries, type BeneficiaryListParams } from '../../lib/api';

export function useBeneficiaries(params: BeneficiaryListParams, enabled = true) {
  return useQuery({
    queryKey: ['staff-beneficiaries', params],
    queryFn: () => apiListBeneficiaries(params),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useBeneficiary(uuid: string | null, enabled = true) {
  return useQuery({
    queryKey: ['staff-beneficiary', uuid],
    queryFn: () => apiGetBeneficiary(uuid as string),
    enabled: enabled && Boolean(uuid),
    staleTime: 1000 * 30,
  });
}
