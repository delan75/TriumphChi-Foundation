import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiCreateBlogPost,
  apiDeleteBlogPost,
  apiGetBlogOptions,
  apiGetBlogPost,
  apiListBlogPosts,
  apiTransitionBlogPostStatus,
  apiUpdateBlogPost,
  type BlogPostListParams,
  type BlogPostPayload,
} from '../../lib/api';

export function useBlogPosts(params: BlogPostListParams, enabled = true) {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => apiListBlogPosts(params),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useBlogPost(uuid: string | null, enabled = true) {
  return useQuery({
    queryKey: ['blog-post', uuid],
    queryFn: () => apiGetBlogPost(uuid as string),
    enabled: enabled && Boolean(uuid),
    staleTime: 1000 * 30,
  });
}

export function useBlogOptions(enabled = true) {
  return useQuery({
    queryKey: ['blog-options'],
    queryFn: apiGetBlogOptions,
    enabled,
    staleTime: 1000 * 60,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogPostPayload) => apiCreateBlogPost(payload),
    onSuccess: (post) => {
      queryClient.setQueryData(['blog-post', post.uuid], post);
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: BlogPostPayload }) =>
      apiUpdateBlogPost(uuid, payload),
    onSuccess: (post) => {
      queryClient.setQueryData(['blog-post', post.uuid], post);
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useTransitionBlogPostStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: string }) =>
      apiTransitionBlogPostStatus(uuid, status),
    onSuccess: (post) => {
      queryClient.setQueryData(['blog-post', post.uuid], post);
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiDeleteBlogPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      void queryClient.invalidateQueries({ queryKey: ['blog-options'] });
    },
  });
}
