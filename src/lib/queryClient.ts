import { QueryClient } from '@tanstack/react-query'

const STALE_TIME_MS = 60_000
const QUERY_RETRY_COUNT = 1

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: QUERY_RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
  },
})
