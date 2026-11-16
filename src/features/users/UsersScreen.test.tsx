import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../../api/types'
import { getUsers } from '../../api/users'
import { queryClientDefaults } from '../../lib/queryClient'
import { UsersScreen } from './UsersScreen'

vi.mock('../../api/users', () => ({
  getUsers: vi.fn(),
}))

const mockedGetUsers = vi.mocked(getUsers)

function makeUser(id: number, name: string): User {
  return {
    id,
    name,
    username: `user${id}`,
    email: `user${id}@example.com`,
    address: {
      street: 'Main Street',
      suite: `Suite ${id}`,
      city: 'Metropolis',
      zipcode: '00000',
      geo: { lat: '0', lng: '0' },
    },
    phone: '000-000',
    website: 'example.com',
    company: { name: 'Acme', catchPhrase: 'Making things', bs: 'synergize' },
  }
}

const users = [makeUser(1, 'Leanne Graham'), makeUser(2, 'Ervin Howell')]

function createTestQueryClient(retry: number | boolean = 0): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { ...queryClientDefaults, retry },
    },
  })
}

function renderUsersScreen(client: QueryClient = createTestQueryClient()) {
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <UsersScreen />
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

describe('UsersScreen', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('T2-1 renders the users returned by the API as links to their posts', async () => {
    mockedGetUsers.mockResolvedValue(users)

    renderUsersScreen()

    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Leanne Graham' }),
    ).toHaveAttribute('href', '/users/1')
  })

  it('T2-2 filters users by a case-insensitive name substring', async () => {
    mockedGetUsers.mockResolvedValue(users)
    const user = userEvent.setup()

    renderUsersScreen()

    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search users by name/i), 'LEa')

    expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument()
  })

  it('T2-3 shows a visible loading state while the query is pending', () => {
    mockedGetUsers.mockImplementation(() => new Promise<User[]>(() => {}))

    renderUsersScreen()

    expect(screen.getByText(/loading users/i)).toBeInTheDocument()
  })

  it('T2-4 shows an error state with a retry action that re-runs the query', async () => {
    mockedGetUsers
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(users)
    const user = userEvent.setup()

    renderUsersScreen()

    expect(await screen.findByText(/failed to load users/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()
    expect(mockedGetUsers).toHaveBeenCalledTimes(2)
  })

  it('T2-5 shows an empty state when the filter matches no user', async () => {
    mockedGetUsers.mockResolvedValue(users)
    const user = userEvent.setup()

    renderUsersScreen()

    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search users by name/i), 'zzz')

    expect(screen.getByText(/no users found/i)).toBeInTheDocument()
    expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument()
    expect(screen.queryByText('Ervin Howell')).not.toBeInTheDocument()
  })

  it('T2-6 reads users from the cache on remount instead of refetching', async () => {
    mockedGetUsers.mockResolvedValue(users)
    const client = createTestQueryClient()

    const firstMount = renderUsersScreen(client)
    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()
    firstMount.unmount()

    renderUsersScreen(client)
    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()

    expect(mockedGetUsers).toHaveBeenCalledTimes(1)
  })
})
