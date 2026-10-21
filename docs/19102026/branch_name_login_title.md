# Branch name on login page and tab title

Date: 19-10-2026

Main doc: `ibb_shop_backend/docs/19102026/public_branch_name_endpoint.md`.

## Done
- `usePublicBranchName` in `src/api/hooks/use-branch.ts` calls `GET /branch/public`.
- Login page shows the shop name (fallback "Iubebe SMS").
- `src/components/branch-title.tsx` sets `document.title` to "<name> - SMS"; `index.html` keeps `Iubebe SMS` as the fallback until it loads.

## Pending
- Change-password page still shows the static "Iubebe SMS".
- Not checked in a browser; needs the backend change deployed first.
