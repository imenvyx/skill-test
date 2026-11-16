import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../../api/users'
import type { User } from '../../api/types'

export const USERS_QUERY_KEY = ['users'] as const

export interface UseUsersResult {
  users: User[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useUsers(): UseUsersResult {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsers,
  })

  return {
    users: data ?? [],
    isLoading,
    isError,
    refetch: () => {
      void refetch()
    },
  }
}
