import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { API_ROUTES } from '@/api/routes'
import type {
  CreateStaffScheduleInput,
  StaffSchedule,
  StaffShiftRegistration,
  UpdateStaffScheduleInput,
} from '@/api/types'

export async function listSchedulesByWeek(weekStartDate: string) {
  const { data } = await apiClient.get<StaffSchedule[]>(API_ROUTES.staffSchedules.list(weekStartDate))
  return data
}

export async function createSchedules(input: CreateStaffScheduleInput) {
  const { data } = await apiClient.post<StaffSchedule[]>(API_ROUTES.staffSchedules.create, input)
  return data
}

export async function getSchedule(id: string) {
  const { data } = await apiClient.get<StaffSchedule>(API_ROUTES.staffSchedules.detail(id))
  return data
}

export async function updateSchedule(id: string, input: UpdateStaffScheduleInput) {
  const { data } = await apiClient.put<StaffSchedule>(API_ROUTES.staffSchedules.update(id), input)
  return data
}

export async function cancelSchedule(id: string) {
  const { data } = await apiClient.post<StaffSchedule>(API_ROUTES.staffSchedules.cancel(id))
  return data
}

export async function registerForShift(scheduleId: string) {
  const { data } = await apiClient.post<StaffShiftRegistration>(
    API_ROUTES.staffSchedules.register(scheduleId),
  )
  return data
}

export async function getRegistrationsByWeek(weekStartDate: string) {
  const { data } = await apiClient.get<StaffShiftRegistration[]>(
    API_ROUTES.staffSchedules.registrationsByWeek(weekStartDate),
  )
  return data
}

export async function getMyRegistrations(weekStartDate: string) {
  const { data } = await apiClient.get<StaffShiftRegistration[]>(
    API_ROUTES.staffSchedules.myRegistrations(weekStartDate),
  )
  return data
}

export async function approveRegistration(id: string, notes?: string) {
  const { data } = await apiClient.post<StaffShiftRegistration>(
    API_ROUTES.staffSchedules.approveRegistration(id),
    { notes },
  )
  return data
}

export async function rejectRegistration(id: string, notes?: string) {
  const { data } = await apiClient.post<StaffShiftRegistration>(
    API_ROUTES.staffSchedules.rejectRegistration(id),
    { notes },
  )
  return data
}

export function useSchedulesByWeek(weekStartDate: string) {
  return useQuery({
    queryKey: queryKeys.staffSchedules.byWeek(weekStartDate),
    queryFn: () => listSchedulesByWeek(weekStartDate),
  })
}

export function useCreateSchedules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSchedules,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all }),
  })
}

export function useRegistrationsByWeek(weekStartDate: string) {
  return useQuery({
    queryKey: queryKeys.staffSchedules.registrationsByWeek(weekStartDate),
    queryFn: () => getRegistrationsByWeek(weekStartDate),
  })
}

export function useMyRegistrations(weekStartDate: string) {
  return useQuery({
    queryKey: queryKeys.staffSchedules.myRegistrations(weekStartDate),
    queryFn: () => getMyRegistrations(weekStartDate),
  })
}

export function useRegisterForShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: registerForShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all })
    },
  })
}

export function useApproveRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; notes?: string }) => approveRegistration(v.id, v.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all })
    },
  })
}

export function useRejectRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; notes?: string }) => rejectRegistration(v.id, v.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all })
    },
  })
}
