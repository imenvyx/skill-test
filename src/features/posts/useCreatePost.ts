import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost } from '../../api/posts'
import type { Post } from '../../api/types'
import type { CreatePostFormValues } from './createPostSchema'
import { postsQueryKey } from './useUserPosts'

export function useCreatePost(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CreatePostFormValues) =>
      createPost({ userId, title: values.title, body: values.body }),
    onSuccess: (created) => {
      queryClient.setQueryData<Post[]>(postsQueryKey(userId), (current) => [
        created,
        ...(current ?? []),
      ])
    },
  })
}
