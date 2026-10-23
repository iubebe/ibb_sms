import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { setItemServed } from '@/api/hooks'
import { queryKeys } from '@/api/query-keys'

/** Taps within this window collapse into one request per item. */
const DEBOUNCE_MS = 500

/**
 * Optimistic served counts for one order. Taps update the screen at once, are
 * debounced per item, and sent as the latest absolute count (the endpoint is
 * idempotent). Requests for the same item never overlap, so the last tap wins.
 */
export function useServedSync(orderId: string) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const draftRef = useRef<Record<string, number>>({})
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const inflight = useRef(new Set<string>())
  const mounted = useRef(true)

  useEffect(() => {
    const pending = timers.current
    mounted.current = true
    return () => {
      mounted.current = false
      pending.forEach(clearTimeout)
    }
  }, [])

  const updateDraft = useCallback((itemId: string, value: number | null) => {
    const next = { ...draftRef.current }
    if (value === null) delete next[itemId]
    else next[itemId] = value
    draftRef.current = next
    if (mounted.current) setDraft(next)
  }, [])

  const flush = useCallback(
    async (itemId: string) => {
      if (inflight.current.has(itemId)) return
      inflight.current.add(itemId)
      try {
        // Loop so a tap made while a request runs is sent right after it.
        while (draftRef.current[itemId] !== undefined && !timers.current.has(itemId)) {
          const sent = draftRef.current[itemId]
          try {
            await setItemServed(orderId, itemId, sent)
            await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
            if (draftRef.current[itemId] === sent) updateDraft(itemId, null)
          } catch (e) {
            updateDraft(itemId, null)
            if (mounted.current) {
              setErrors((prev) => ({ ...prev, [itemId]: e instanceof Error ? e.message : 'Không lưu được' }))
            }
          }
        }
      } finally {
        inflight.current.delete(itemId)
      }
    },
    [orderId, queryClient, updateDraft],
  )

  /** Sets the served count for an item; `immediate` skips the debounce. */
  const setServed = useCallback(
    (itemId: string, value: number, immediate = false) => {
      setErrors((prev) => {
        if (!(itemId in prev)) return prev
        const { [itemId]: _removed, ...rest } = prev
        return rest
      })
      updateDraft(itemId, value)
      clearTimeout(timers.current.get(itemId))
      timers.current.set(
        itemId,
        setTimeout(
          () => {
            timers.current.delete(itemId)
            void flush(itemId)
          },
          immediate ? 0 : DEBOUNCE_MS,
        ),
      )
    },
    [flush, updateDraft],
  )

  return { draft, errors, setServed }
}
