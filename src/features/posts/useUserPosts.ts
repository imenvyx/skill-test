import { useQuery } from '@tanstack/react-query'
import { getPostsByUserId } from '../../api/posts'
import type { Post } from '../../api/types'

export const POSTS_QUERY_KEY = 'posts'

export function postsQueryKey(userId: number) {
  return [POSTS_QUERY_KEY, userId] as const
}

export interface UseUserPostsResult {
  posts: Post[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useUserPosts(userId: number): UseUserPostsResult {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: postsQueryKey(userId),
    queryFn: () => getPostsByUserId(userId),
    enabled: Number.isFinite(userId),
  })

  return {
    posts: data ?? [],
    isLoading,
    isError,
    refetch: () => {
      void refetch()
    },
  }
}
