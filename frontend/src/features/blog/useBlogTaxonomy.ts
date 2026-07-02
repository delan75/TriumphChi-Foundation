import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiCreateBlogCategory,
  apiCreateBlogTag,
  apiDeleteBlogCategory,
  apiDeleteBlogTag,
  apiUpdateBlogCategory,
  apiUpdateBlogTag,
  type BlogCategoryPayload,
  type BlogTagPayload,
} from '../../lib/api';

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogCategoryPayload) => apiCreateBlogCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: BlogCategoryPayload }) => apiUpdateBlogCategory(uuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiDeleteBlogCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useCreateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogTagPayload) => apiCreateBlogTag(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useUpdateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: BlogTagPayload }) => apiUpdateBlogTag(uuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useDeleteBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiDeleteBlogTag,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}
