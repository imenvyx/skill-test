import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Post } from '../../api/types'
import { getPostsByUserId } from '../../api/posts'
import { queryClientDefaults } from '../../lib/queryClient'
import { UserPostsScreen } from './UserPostsScreen'

vi.mock('../../api/posts', () => ({
  getPostsByUserId: vi.fn(),
}))

const mockedGetPosts = vi.mocked(getPostsByUserId)

function makePost(id: number, title: string, body: string): Post {
  return { userId: 1, id, title, body }
}

const posts = [
  makePost(1, 'First post', 'First body'),
  makePost(2, 'Second post', 'Second body'),
]

function createTestQueryClient(retry: number | boolean = 0): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { ...queryClientDefaults, retry },
    },
  })
}

function renderUserPostsScreen(
  userId = '1',
  client: QueryClient = createTestQueryClient(),
) {
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/users/${userId}`]}>
          <Routes>
            <Route path="/users/:userId" element={<UserPostsScreen />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

describe('UserPostsScreen', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('T3-1 renders the posts of the routed user with title and body', async () => {
    mockedGetPosts.mockResolvedValue(posts)

    renderUserPostsScreen('1')

    expect(await screen.findByText('First post')).toBeInTheDocument()
    expect(screen.getByText('First body')).toBeInTheDocument()
    expect(screen.getByText('Second post')).toBeInTheDocument()
    expect(screen.getByText('Second body')).toBeInTheDocument()
    expect(mockedGetPosts).toHaveBeenCalledWith(1)
  })

  it('T3-2 shows a loading state, then the posts once the request resolves', async () => {
    let resolvePosts!: (value: Post[]) => void
    const deferred = new Promise<Post[]>((resolve) => {
      resolvePosts = resolve
    })
    mockedGetPosts.mockReturnValue(deferred)

    renderUserPostsScreen('1')

    expect(screen.getByText(/loading posts/i)).toBeInTheDocument()

    await act(async () => {
      resolvePosts(posts)
    })

    expect(await screen.findByText('First post')).toBeInTheDocument()
  })

  it('T3-3 shows an error state with a retry action that re-runs the request', async () => {
    mockedGetPosts
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(posts)
    const user = userEvent.setup()

    renderUserPostsScreen('1')

    expect(await screen.findByText(/failed to load posts/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('First post')).toBeInTheDocument()
    expect(mockedGetPosts).toHaveBeenCalledTimes(2)
  })

  it('T3-4 shows a not-found state when the user has no posts', async () => {
    mockedGetPosts.mockResolvedValue([])

    renderUserPostsScreen('999')

    expect(await screen.findByText(/no posts found/i)).toBeInTheDocument()
    expect(mockedGetPosts).toHaveBeenCalledWith(999)
  })

  it('T3-5 reads the posts from the cache on remount instead of refetching', async () => {
    mockedGetPosts.mockResolvedValue(posts)
    const client = createTestQueryClient()

    const firstMount = renderUserPostsScreen('1', client)
    expect(await screen.findByText('First post')).toBeInTheDocument()
    firstMount.unmount()

    renderUserPostsScreen('1', client)
    expect(await screen.findByText('First post')).toBeInTheDocument()

    expect(mockedGetPosts).toHaveBeenCalledTimes(1)
  })
})
