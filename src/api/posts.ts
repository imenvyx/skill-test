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

export interface UpdatePostInput {
  title: string
  body: string
}

export function updatePost(id: number, input: UpdatePostInput): Promise<Post> {
  return request<Post>(`/posts/${id}`, { method: 'PUT', body: input })
}

export function deletePost(id: number): Promise<void> {
  return request<void>(`/posts/${id}`, { method: 'DELETE' })
}
