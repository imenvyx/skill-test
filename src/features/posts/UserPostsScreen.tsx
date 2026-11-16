import type { ReactElement } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CreatePostForm } from "./CreatePostForm";
import { EditPostForm } from "./EditPostForm";
import { useCreatePost } from "./useCreatePost";
import { useDeletePost } from "./useDeletePost";
import { useUpdatePost } from "./useUpdatePost";
import { useUserPosts } from "./useUserPosts";

export function UserPostsScreen(): ReactElement {
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = Number(userId);
  const { posts, isLoading, isError, refetch } = useUserPosts(numericUserId);
  const createPostMutation = useCreatePost(numericUserId);
  const updatePostMutation = useUpdatePost(numericUserId);
  const deletePostMutation = useDeletePost(numericUserId);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(
    null,
  );

  async function confirmDelete(id: number): Promise<void> {
    try {
      await deletePostMutation.mutateAsync(id);
      setConfirmingDeleteId(null);
    } catch {
      // Keep the confirmation and the list intact; the error is shown inline.
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Loading posts...</p>;
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
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="mb-4 text-xl font-semibold">Posts</h2>
        <Link to="/users" className="mb-4 inline-block text-blue-600 underline">
          Back to users
        </Link>
      </div>

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
              {editingPostId === post.id ? (
                <EditPostForm
                  post={post}
                  onSave={async (values) => {
                    await updatePostMutation.mutateAsync({
                      id: post.id,
                      values,
                    });
                    setEditingPostId(null);
                  }}
                  onCancel={() => setEditingPostId(null)}
                  isSubmitting={updatePostMutation.isPending}
                  hasError={updatePostMutation.isError}
                />
              ) : (
                <>
                  <h3 className="font-semibold text-slate-900">{post.title}</h3>
                  <p className="mt-1 text-slate-600">{post.body}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updatePostMutation.reset();
                        setEditingPostId(post.id);
                      }}
                      className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(post.id)}
                      className="rounded border border-red-300 px-3 py-1 text-sm text-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  {confirmingDeleteId === post.id && (
                    <div className="mt-3 rounded border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-700">Delete this post?</p>
                      {deletePostMutation.isError && (
                        <p role="alert" className="mt-2 text-sm text-red-700">
                          Failed to delete the post. Please try again.
                        </p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => confirmDelete(post.id)}
                          disabled={deletePostMutation.isPending}
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                        >
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          disabled={deletePostMutation.isPending}
                          className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
