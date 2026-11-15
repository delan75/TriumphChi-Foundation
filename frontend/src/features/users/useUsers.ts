import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiCreateManagedUser,
  apiGetManagedUser,
  apiGetUserAccessOptions,
  apiListManagedUsers,
  apiTerminateManagedUserSessions,
  apiTransitionManagedUserStatus,
  apiUpdateManagedUser,
  apiUpdateManagedUserAccess,
  type ManagedUserListParams,
  type ManagedUserPayload,
} from '../../lib/api';

export function useManagedUsers(params: ManagedUserListParams, enabled = true) {
  return useQuery({
    queryKey: ['managed-users', params],
    queryFn: () => apiListManagedUsers(params),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useManagedUser(uuid: string | null, enabled = true) {
  return useQuery({
    queryKey: ['managed-user', uuid],
    queryFn: () => apiGetManagedUser(uuid as string),
    enabled: enabled && Boolean(uuid),
    staleTime: 1000 * 30,
  });
}

export function useUserAccessOptions(enabled = true) {
  return useQuery({
    queryKey: ['managed-user-access-options'],
    queryFn: apiGetUserAccessOptions,
    enabled,
    staleTime: 1000 * 60,
  });
}

export function useCreateManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManagedUserPayload) => apiCreateManagedUser(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(['managed-user', user.uuid], user);
      void queryClient.invalidateQueries({ queryKey: ['managed-users'] });
    },
  });
}

export function useUpdateManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: ManagedUserPayload }) =>
      apiUpdateManagedUser(uuid, payload),
    onSuccess: (user) => {
      queryClient.setQueryData(['managed-user', user.uuid], user);
      void queryClient.invalidateQueries({ queryKey: ['managed-users'] });
    },
  });
}

export function useUpdateManagedUserAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      roles,
      direct_permissions,
    }: {
      uuid: string;
      roles: string[];
      direct_permissions: string[];
    }) => apiUpdateManagedUserAccess(uuid, { roles, direct_permissions }),
    onSuccess: (user) => {
      queryClient.setQueryData(['managed-user', user.uuid], user);
      void queryClient.invalidateQueries({ queryKey: ['managed-users'] });
    },
  });
}

export function useTransitionManagedUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      action,
      note,
    }: {
      uuid: string;
      action: 'activate' | 'suspend' | 'archive';
      note?: string;
    }) => apiTransitionManagedUserStatus(uuid, action, note),
    onSuccess: (user) => {
      queryClient.setQueryData(['managed-user', user.uuid], user);
      void queryClient.invalidateQueries({ queryKey: ['managed-users'] });
    },
  });
}

export function useTerminateManagedUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiTerminateManagedUserSessions,
    onSuccess: (user) => {
      queryClient.setQueryData(['managed-user', user.uuid], user);
      void queryClient.invalidateQueries({ queryKey: ['managed-users'] });
    },
  });
}
