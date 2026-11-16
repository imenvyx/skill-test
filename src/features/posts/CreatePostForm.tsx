import type { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createPostSchema,
  type CreatePostFormValues,
} from './createPostSchema'

interface CreatePostFormProps {
  onCreate: (values: CreatePostFormValues) => Promise<unknown>
  isSubmitting: boolean
  hasError: boolean
}

export function CreatePostForm({
  onCreate,
  isSubmitting,
  hasError,
}: CreatePostFormProps): ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: '', body: '' },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onCreate(values)
      reset()
    } catch {
      // Keep the typed values; the screen surfaces the failure through hasError.
    }
  })

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mb-6 space-y-3 rounded border border-slate-200 bg-white p-4"
    >
      <h3 className="text-lg font-semibold">Create a post</h3>

      <div>
        <label
          htmlFor="post-title"
          className="block text-sm font-medium text-slate-700"
        >
          Title
        </label>
        <input
          id="post-title"
          type="text"
          disabled={isSubmitting}
          className="w-full rounded border border-slate-300 px-3 py-2"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="post-body"
          className="block text-sm font-medium text-slate-700"
        >
          Body
        </label>
        <textarea
          id="post-body"
          rows={3}
          disabled={isSubmitting}
          className="w-full rounded border border-slate-300 px-3 py-2"
          {...register('body')}
        />
        {errors.body && (
          <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
        )}
      </div>

      {hasError && (
        <p role="alert" className="text-sm text-red-700">
          Failed to create the post. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        Create post
      </button>
    </form>
  )
}
