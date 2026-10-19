import { useEffect } from 'react'
import { usePublicBranchName } from '@/api/hooks'

const FALLBACK_TITLE = 'Iubebe SMS'

/** Keeps the browser tab title in sync with the shop name (index.html holds the fallback). */
export function BranchTitle() {
  const name = usePublicBranchName().data
  useEffect(() => {
    document.title = name ? `${name} - SMS` : FALLBACK_TITLE
  }, [name])
  return null
}
