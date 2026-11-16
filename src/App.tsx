import type { ReactElement } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { UsersScreen } from './features/users/UsersScreen'

function App(): ReactElement {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold">JSONPlaceholder Users</h1>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-6">
        <Routes>
          <Route
            path="/"
            element={
              <p>
                Browse the{' '}
                <Link className="text-blue-600 underline" to="/users">
                  users list
                </Link>
                .
              </p>
            }
          />
          <Route path="/users" element={<UsersScreen />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
