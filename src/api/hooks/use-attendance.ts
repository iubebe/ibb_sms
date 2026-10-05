import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type {
  AdjustAttendanceInput,
  AttendanceRecord,
  AttendanceReport,
  MyAttendance,
} from '@/api/types'
import { env } from '@/config/env'

export async function getMyAttendance() {
  const { data } = await apiClient.get<MyAttendance>(API_ROUTES.attendance.me)
  return data
}

/** Sends the captured JPEG as multipart field `photo`. */
async function postPhoto(path: string, photo: Blob) {
  const body = new FormData()
  body.append('photo', photo, 'photo.jpg')
  // The client defaults to JSON, which would serialize the FormData as JSON. Longer
  // timeout than usual because the photo goes over mobile data.
  const { data } = await apiClient.post<AttendanceRecord>(path, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  })
  return data
}

export const checkIn = (photo: Blob) => postPhoto(API_ROUTES.attendance.checkIn, photo)
export const checkOut = (photo: Blob) => postPhoto(API_ROUTES.attendance.checkOut, photo)

export async function getAttendanceReport(month: string) {
  const { data } = await apiClient.get<AttendanceReport>(API_ROUTES.attendance.report, { params: { month } })
  return data
}

export async function getAttendanceList(month: string, userId?: string) {
  const { data } = await apiClient.get<AttendanceRecord[]>(API_ROUTES.attendance.list, {
    params: { month, userId },
  })
  return data
}

export async function adjustAttendance(id: string, input: AdjustAttendanceInput) {
  const { data } = await apiClient.patch<AttendanceRecord>(API_ROUTES.attendance.detail(id), input)
  return data
}

export async function exportAttendance(month: string) {
  const { data } = await apiClient.get<Blob>(API_ROUTES.attendance.exportReport, {
    params: { month },
    responseType: 'blob',
    timeout: 30_000,
  })
  return data
}

/** Photos are streamed by the backend (admin only); the cookie authorizes the `<img>`. */
export function attendancePhotoUrl(id: string, kind: 'check-in' | 'check-out') {
  return `${env.apiUrl}${API_ROUTES.attendance.photo(id, kind)}`
}

/** The signed-in staff/cashier's own state and totals. */
export function useMyAttendance() {
  return useQuery({ queryKey: queryKeys.attendance.me, queryFn: getMyAttendance, staleTime: 10_000 })
}

function useInvalidateAttendance() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
}

export function useCheckIn() {
  const invalidate = useInvalidateAttendance()
  return useMutation({ mutationFn: checkIn, onSuccess: invalidate })
}

export function useCheckOut() {
  const invalidate = useInvalidateAttendance()
  return useMutation({ mutationFn: checkOut, onSuccess: invalidate })
}

export function useAttendanceReport(month: string) {
  return useQuery({ queryKey: queryKeys.attendance.report(month), queryFn: () => getAttendanceReport(month) })
}

export function useAttendanceList(month: string, userId?: string) {
  return useQuery({
    queryKey: queryKeys.attendance.list(month, userId),
    queryFn: () => getAttendanceList(month, userId),
  })
}

export function useAdjustAttendance() {
  const invalidate = useInvalidateAttendance()
  return useMutation({
    mutationFn: (v: { id: string; input: AdjustAttendanceInput }) => adjustAttendance(v.id, v.input),
    onSuccess: invalidate,
  })
}

export function useExportAttendance() {
  return useMutation({ mutationFn: exportAttendance })
}
