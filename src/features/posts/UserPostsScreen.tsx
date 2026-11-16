import type { ReactElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CreatePostForm } from './CreatePostForm'
import { useCreatePost } from './useCreatePost'
import { useUserPosts } from './useUserPosts'

export function UserPostsScreen(): ReactElement {
  const { userId } = useParams<{ userId: string }>()
  const numericUserId = Number(userId)
  const { posts, isLoading, isError, refetch } = useUserPosts(numericUserId)
  const createPostMutation = useCreatePost(numericUserId)

  if (isLoading) {
    return <p className="text-slate-500">Loading posts...</p>
  }

  if (isError) {
    return (
      <div role="alert" className="rounded border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Failed to load posts.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Posts</h2>
      <Link to="/users" className="mb-4 inline-block text-blue-600 underline">
        Back to users
      </Link>

      <CreatePostForm
        onCreate={createPostMutation.mutateAsync}
        isSubmitting={createPostMutation.isPending}
        hasError={createPostMutation.isError}
      />

      {posts.length === 0 ? (
        <p className="text-slate-500">No posts found for this user.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded border border-slate-200 bg-white p-4"
            >
              <h3 className="font-semibold text-slate-900">{post.title}</h3>
              <p className="mt-1 text-slate-600">{post.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
