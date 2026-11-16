import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePost } from '../../api/posts'
import type { Post } from '../../api/types'
import type { CreatePostFormValues } from './createPostSchema'
import { postsQueryKey } from './useUserPosts'

export interface UpdatePostVariables {
  id: number
  values: CreatePostFormValues
}

export function useUpdatePost(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: UpdatePostVariables) =>
      updatePost(id, { title: values.title, body: values.body }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Post[]>(postsQueryKey(userId), (current) =>
        (current ?? []).map((post) =>
          post.id === updated.id ? updated : post,
        ),
      )
    },
  })
}
