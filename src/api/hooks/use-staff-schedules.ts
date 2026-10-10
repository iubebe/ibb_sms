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

export async function proposeShifts(input: CreateStaffScheduleInput) {
  const { data } = await apiClient.post<StaffSchedule[]>(API_ROUTES.staffSchedules.proposals, input)
  return data
}

export async function getProposalsByWeek(weekStartDate: string) {
  const { data } = await apiClient.get<StaffSchedule[]>(
    API_ROUTES.staffSchedules.proposalsByWeek(weekStartDate),
  )
  return data
}

export async function getMyProposals(weekStartDate: string) {
  const { data } = await apiClient.get<StaffSchedule[]>(
    API_ROUTES.staffSchedules.myProposals(weekStartDate),
  )
  return data
}

export async function approveProposal(id: string, notes?: string) {
  const { data } = await apiClient.post<StaffSchedule>(
    API_ROUTES.staffSchedules.approveProposal(id),
    { notes },
  )
  return data
}

export async function rejectProposal(id: string, notes?: string) {
  const { data } = await apiClient.post<StaffSchedule>(
    API_ROUTES.staffSchedules.rejectProposal(id),
    { notes },
  )
  return data
}

export async function cancelProposal(id: string) {
  const { data } = await apiClient.post<StaffSchedule>(
    API_ROUTES.staffSchedules.cancelProposal(id),
  )
  return data
}

export function useProposalsByWeek(weekStartDate: string) {
  return useQuery({
    queryKey: queryKeys.staffSchedules.proposalsByWeek(weekStartDate),
    queryFn: () => getProposalsByWeek(weekStartDate),
  })
}

export function useMyProposals(weekStartDate: string) {
  return useQuery({
    queryKey: queryKeys.staffSchedules.myProposals(weekStartDate),
    queryFn: () => getMyProposals(weekStartDate),
  })
}

export function useProposeShifts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: proposeShifts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all }),
  })
}

export function useApproveProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; notes?: string }) => approveProposal(v.id, v.notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all }),
  })
}

export function useRejectProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; notes?: string }) => rejectProposal(v.id, v.notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all }),
  })
}

export function useCancelProposal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelProposal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staffSchedules.all }),
  })
}
