# CD: version-bump PRs to ibb_shop_release

Date: 07/10/2026

## Done

- `release.yml`: new job `request-prod-deploy`. After release-please creates a release and the image is pushed, it runs `gh workflow run bump-version.yml -R iubebe/ibb_shop_release -f service=sms -f version=<X.Y.Z> -f environment=prod`.
- New `staging.yml`: every push to `develop` builds and pushes `ghcr.io/iubebe/ibb_sms:dev-<sha7>` with the staging API URLs, then requests the same PR for `environment=staging`. Only the newest develop run is kept.
- The release repo opens/updates the PR `bump/<env>/sms`; devops merge it to deploy (see `ibb_shop_release/docs/07102026/version_bump_prs.md`).

## Decisions

- Vite bakes `VITE_API_URL` / `VITE_WS_URL` into the bundle, so images are per environment: `X.Y.Z` (built with the prod variables `VITE_API_URL`/`VITE_WS_URL`) is prod only, `dev-<sha>` (built with `STAGING_VITE_API_URL`/`STAGING_VITE_WS_URL`) is staging only. Never put a tag in the other environment's `versions.env`; a staged build cannot be promoted as is.
- CI can only start a workflow in the release repo, not push to it.

## Pending

- Repo variables `STAGING_VITE_API_URL` and `STAGING_VITE_WS_URL` (staging build fails with a clear error until set); secret `RELEASE_REPO_TOKEN` (fine-grained PAT on `iubebe/ibb_shop_release`, Actions read/write).
- Not run; first runs are the next push to `develop` and the next release.
