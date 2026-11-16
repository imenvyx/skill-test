import type { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Post } from '../../api/types'
import {
  createPostSchema,
  type CreatePostFormValues,
} from './createPostSchema'

interface EditPostFormProps {
  post: Post
  onSave: (values: CreatePostFormValues) => Promise<unknown>
  onCancel: () => void
  isSubmitting: boolean
  hasError: boolean
}

export function EditPostForm({
  post,
  onSave,
  onCancel,
  isSubmitting,
  hasError,
}: EditPostFormProps): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: post.title, body: post.body },
  })

  const titleId = `edit-title-${post.id}`
  const bodyId = `edit-body-${post.id}`

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          await onSave(values)
        } catch {
          // Keep the typed values; the screen surfaces the failure via hasError.
        }
      })}
      noValidate
      className="space-y-3"
    >
      <h4 className="text-base font-semibold">Edit post</h4>

      <div>
        <label
          htmlFor={titleId}
          className="block text-sm font-medium text-slate-700"
        >
          Edit title
        </label>
        <input
          id={titleId}
          type="text"
          className="w-full rounded border border-slate-300 px-3 py-2"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor={bodyId}
          className="block text-sm font-medium text-slate-700"
        >
          Edit body
        </label>
        <textarea
          id={bodyId}
          rows={3}
          className="w-full rounded border border-slate-300 px-3 py-2"
          {...register('body')}
        />
        {errors.body && (
          <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
        )}
      </div>

      {hasError && (
        <p role="alert" className="text-sm text-red-700">
          Failed to update the post. Please try again.
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          Save changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded border border-slate-300 px-4 py-2 text-slate-700 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
