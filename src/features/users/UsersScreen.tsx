import { useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useUsers } from './useUsers'

export function UsersScreen(): ReactElement {
  const { users, isLoading, isError, refetch } = useUsers()
  const [search, setSearch] = useState('')

  const normalizedSearch = search.trim().toLowerCase()
  const filteredUsers = normalizedSearch
    ? users.filter((user) =>
        user.name.toLowerCase().includes(normalizedSearch),
      )
    : users

  if (isLoading) {
    return <p className="text-slate-500">Loading users...</p>
  }

  if (isError) {
    return (
      <div role="alert" className="rounded border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Failed to load users.</p>
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
      <h2 className="mb-4 text-xl font-semibold">Users</h2>

      <label
        htmlFor="users-search"
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        Search users by name
      </label>
      <input
        id="users-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-4 w-full rounded border border-slate-300 px-3 py-2"
      />

      {filteredUsers.length === 0 ? (
        <p className="text-slate-500">No users found.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <Link
                to={`/users/${user.id}`}
                className="block px-4 py-3 text-blue-600 hover:bg-slate-50"
              >
                {user.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
