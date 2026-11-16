import { request } from './client'
import type { Post } from './types'

export function getPostsByUserId(userId: number): Promise<Post[]> {
  return request<Post[]>(`/posts?userId=${userId}`)
}

export interface CreatePostInput {
  userId: number
  title: string
  body: string
}

export function createPost(input: CreatePostInput): Promise<Post> {
  return request<Post>('/posts', { method: 'POST', body: input })
}
