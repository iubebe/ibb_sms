# ibb_sms — Conventions

Shop Management System (alias `ibb_shop_sms`): dashboard, product management, HR face-ID check-in, order reception. Used on **phones first** (staff walking the floor), and on tablet/desktop in the back office. Mobile is the primary target; larger screens enlarge the layout.

Stack: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui (`base-nova`), Zustand, TanStack Query. Alias `@/` -> `src/`. Package manager: pnpm.

Styling, touch/UX, Tailwind/shadcn, code-structure and reuse rules are the same as `ibb_shop_guest/CLAUDE.md`; read it and follow it. Differences for this app:

- Layout is not a single `max-w-md` column. Mobile: sticky top bar + bottom tab bar (`src/features/shell/app-shell.tsx`). `md` and up: left sidebar, content `max-w-5xl`.
- Tables/lists: on mobile render rows as stacked cards; switch to a real table only from `md:`.
- Routing: React Router (`src/router.tsx`). Authenticated pages are children of `ProtectedRoute` (`src/features/auth/route-guards.tsx`), which renders the shell. Add new pages there and to `NAV_ITEMS`; unknown URLs hit `PageNotFound`.
- Before creating a new reusable component or hook, propose it first (same reuse policy as guest).

## Verification

- `pnpm build` and `pnpm lint` before reporting done; check UI at 390px wide.

## Known gotchas

- `npx shadcn add` generates `import { cn } from "cn"` and re-adds the stray `cn` package. After each add: change the import to `@/lib/utils`, then `pnpm remove cn`.
