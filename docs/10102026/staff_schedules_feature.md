# Staff Schedule Control & Registration Feature

**Date:** 10/10/2026

## Overview

Implemented staff shift scheduling and registration system allowing:
- **Admins** to create, manage, and review staff shift registrations
- **Staff** to register for available shifts each week

## Features

### Admin Features
1. **Shift Management** (`/staff/schedules`)
   - View all shifts for a week
   - Create shifts with start/end times, shift type, position
   - Edit shift details
   - Cancel shifts
   - Assign staff to approved registrations

2. **Registration Review** (`/staff/schedules` - Registrations tab)
   - View pending shift registrations from staff
   - Approve or reject registrations with optional notes
   - View approval history

### Staff Features
1. **Shift Registration** (`/schedules/register`)
   - View available shifts for the current week
   - Register for shifts (one-click)
   - View registration status (pending/approved/rejected)
   - See admin feedback on rejected registrations

## Backend Implementation

### Database Entities

**StaffSchedule** (`staff_schedules` table)
- Shift information for a specific day and time
- Supports weekly scheduling (Monday-Sunday)
- Tracks assigned staff member
- Status: scheduled, cancelled, no-show

**StaffShiftRegistration** (`staff_shift_registrations` table)
- Links staff member to a shift
- Tracks registration status: pending, approved, rejected
- Admin notes and review timestamps

### API Endpoints

**Shifts Management**
- `POST /api/staff-schedules` - Create shifts for a week (admin only)
- `GET /api/staff-schedules?weekStartDate=YYYY-MM-DD` - List shifts
- `GET /api/staff-schedules/:scheduleId` - Get shift details
- `PUT /api/staff-schedules/:scheduleId` - Update shift (admin only)
- `POST /api/staff-schedules/:scheduleId/cancel` - Cancel shift (admin only)

**Registrations**
- `POST /api/staff-schedules/:scheduleId/register` - Staff registers for shift
- `GET /api/staff-schedules/registrations/by-week/:weekStartDate` - List all registrations (admin)
- `GET /api/staff-schedules/my-registrations/:weekStartDate` - Staff's registrations
- `POST /api/staff-schedules/registrations/:registrationId/approve` - Approve (admin)
- `POST /api/staff-schedules/registrations/:registrationId/reject` - Reject with notes (admin)

## Frontend Implementation

### SMS App Pages

**Admin Staff Schedules** (`/staff/schedules`)
- Two-tab interface: Shifts & Registrations
- Week navigation (prev/next week)
- Tabular display of shifts and registrations
- Inline approval/rejection buttons

**Staff Registration** (`/schedules/register`)
- Available shifts for current week
- Register/unregister buttons
- Track registration status (pending/approved/rejected)
- Display admin feedback

### Components
- `AdminSchedulesPage` - Main admin dashboard
- `StaffRegistrationPage` - Staff self-service registration
- `SchedulesList` - Shift display component
- `RegistrationsList` - Registration review component

### API Hooks (`use-staff-schedules.ts`)
- `useSchedulesByWeek(weekStartDate)` - Fetch shifts
- `useRegistrationsByWeek(weekStartDate)` - Fetch registrations (admin)
- `useMyRegistrations(weekStartDate)` - Fetch user's registrations (staff)
- `useRegisterForShift()` - Register for shift mutation
- `useApproveRegistration()` - Approve registration mutation
- `useRejectRegistration()` - Reject registration mutation

## Navigation

Added to SMS app main navigation:
- Admin: "Lịch làm việc" (Staff Schedules) -> `/staff/schedules`
- Staff: "Đăng ký ca làm" (Register for Shifts) -> `/schedules/register`

## Data Flow

### Creating Shifts (Admin)
1. Admin navigates to `/staff/schedules`
2. Admin inputs shifts for the week (day, start time, end time, type)
3. System creates multiple shift records
4. Shifts appear in "Shifts" tab

### Registering for Shift (Staff)
1. Staff navigates to `/schedules/register`
2. Selects a week
3. Views available shifts
4. Clicks "Register" for desired shift
5. Registration sent with "pending" status

### Approving Registration (Admin)
1. Admin views "Registrations" tab
2. Reviews pending registrations
3. Clicks "Approve" or "Reject"
4. System updates registration status
5. On approval: staff member assigned to shift
6. Staff member notified via UI

## Files Created/Modified

### Backend
- `src/database/entities/staff-schedule.entity.ts` (NEW)
- `src/database/entities/staff-shift-registration.entity.ts` (NEW)
- `src/modules/staff-schedules/` (NEW - service, controller, module, DTOs)
- `src/app.module.ts` (modified - added StaffSchedulesModule)

### Frontend (SMS)
- `src/features/staff-schedules/` (NEW - pages and components)
- `src/api/hooks/use-staff-schedules.ts` (NEW)
- `src/lib/date-utils.ts` (NEW - date utilities)
- `src/api/types.ts` (modified - added schedule types)
- `src/api/routes.ts` (modified - added schedule routes)
- `src/api/query-keys.ts` (modified - added query keys)
- `src/router.tsx` (modified - added routes)
- `src/features/shell/nav-items.ts` (modified - added nav items)

## Future Enhancements

1. **Edit registrations** - Staff can withdraw/change registrations
2. **Recurring schedules** - Auto-create weekly/bi-weekly patterns
3. **Shift templates** - Save and reuse shift configurations
4. **Notifications** - Email/SMS when registrations approved/rejected
5. **Attendance sync** - Link schedules to actual attendance
6. **Shift swaps** - Allow staff to request/approve shift swaps
7. **Conflict detection** - Prevent double-booking same staff
8. **Analytics** - View shift coverage, staff utilization

## Testing

All backend tests pass (158 tests).

**Test coverage includes:**
- Service methods for creating/updating/deleting shifts
- Registration approval/rejection flows
- Permission checks (admin vs staff)
- Error handling (not found, already registered, etc.)

## Known Limitations

1. No WebSocket updates - UI refreshes on manual action
2. No email notifications yet
3. No recurring schedule creation
4. No shift swap functionality
5. No historical data beyond current status
