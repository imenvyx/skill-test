import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../../api/posts'
import type { Post } from '../../api/types'
import { postsQueryKey } from './useUserPosts'

export function useDeletePost(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Post[]>(postsQueryKey(userId), (current) =>
        (current ?? []).filter((post) => post.id !== id),
      )
    },
  })
}
