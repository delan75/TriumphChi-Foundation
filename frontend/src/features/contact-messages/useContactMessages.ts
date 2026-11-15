import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiAssignContactMessage,
  apiDeleteContactMessage,
  apiForwardContactMessage,
  apiGetContactMessage,
  apiListContactAssignees,
  apiListContactMessages,
  apiUpdateContactMessage,
  type ContactMessageListParams,
} from '../../lib/api';

export function useContactMessages(params: ContactMessageListParams, enabled = true) {
  return useQuery({
    queryKey: ['staff-contact-messages', params],
    queryFn: () => apiListContactMessages(params),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useContactMessage(uuid: string | null, enabled = true) {
  return useQuery({
    queryKey: ['staff-contact-message', uuid],
    queryFn: () => apiGetContactMessage(uuid as string),
    enabled: enabled && Boolean(uuid),
    staleTime: 1000 * 30,
  });
}

export function useContactAssignees(enabled = true) {
  return useQuery({
    queryKey: ['staff-contact-assignees'],
    queryFn: apiListContactAssignees,
    enabled,
    staleTime: 1000 * 60,
  });
}

export function useUpdateContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      status,
      staff_notes,
    }: {
      uuid: string;
      status: string;
      staff_notes?: string | null;
    }) => apiUpdateContactMessage(uuid, { status, staff_notes }),
    onSuccess: (message) => {
      queryClient.setQueryData(['staff-contact-message', message.uuid], message);
      void queryClient.invalidateQueries({ queryKey: ['staff-contact-messages'] });
    },
  });
}

export function useAssignContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, assignedTo }: { uuid: string; assignedTo: number | null }) =>
      apiAssignContactMessage(uuid, assignedTo),
    onSuccess: (message) => {
      queryClient.setQueryData(['staff-contact-message', message.uuid], message);
      void queryClient.invalidateQueries({ queryKey: ['staff-contact-messages'] });
    },
  });
}

export function useForwardContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      to_email,
      note,
      mark_as_replied,
    }: {
      uuid: string;
      to_email: string;
      note?: string;
      mark_as_replied?: boolean;
    }) => apiForwardContactMessage(uuid, { to_email, note, mark_as_replied }),
    onSuccess: (message) => {
      queryClient.setQueryData(['staff-contact-message', message.uuid], message);
      void queryClient.invalidateQueries({ queryKey: ['staff-contact-messages'] });
    },
  });
}

export function useArchiveContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiDeleteContactMessage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff-contact-messages'] });
    },
  });
}
