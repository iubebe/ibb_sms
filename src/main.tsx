import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { setSessionExpiredHandler } from '@/api/client'
import { queryClient } from '@/api/query-client'
import { queryKeys } from '@/api/query-keys'
import { router } from './router.tsx'

// Refresh failed: forget the user so the app falls back to the login screen.
setSessionExpiredHandler(() => queryClient.setQueryData(queryKeys.auth.me, null))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
