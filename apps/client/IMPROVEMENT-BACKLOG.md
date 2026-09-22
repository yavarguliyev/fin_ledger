# Client improvement backlog

Known problems in `apps/client` (Angular) and how we plan to fix each one.
The API is in [`apps/core-api/IMPROVEMENT-BACKLOG.md`](../core-api/IMPROVEMENT-BACKLOG.md). Shared infrastructure is in
[`packages/IMPROVEMENT-BACKLOG.md`](../../packages/IMPROVEMENT-BACKLOG.md).

**How to use this file**

1. Pick the highest-priority open item. Fix it in its own small change.
2. Run every check in its **Verify** list in a real browser against the real API.
3. When every check passes, **delete the whole section** in the same commit as the fix.
   An item that is still here is not done.

Priority: **P0** can take money twice or ships a broken build · **P1** security and stuck UI states ·
**P2** structure · **P3** tests and polish. Item IDs use the `WEB-` prefix.

Last full review: 2026-09-22.

---

## P0

### WEB-P0-2 · Production builds point at localhost, and builds rewrite committed files

**Problem.** Committed `environment.prod.ts` has `apiUrl: 'http://localhost:3000/api/v1'` and `wsUrl: 'wsUrl'`.
- **Committed files rewritten:** `scripts/load-env.js` rewrites both committed environment files on every
  `start`/`build`, so builds dirty git.
- **Deploys ship localhost:** Netlify runs `npx ng build` without the script, so deploys use the committed localhost values.

**Solution.** Stop generating source files. Serve a runtime `config.json` (written per environment at deploy time),
load it in an `APP_INITIALIZER`, and expose it through a `ConfigService`. Delete `load-env.js` and the generated values.

**Verify.**
- [ ] `git status` is clean after `npm run build`.
- [ ] The same build artifact talks to different APIs by changing only `config.json`.

---

## P1

### WEB-P1-1 · Deposits can't handle 3-D Secure or pending results

**Problem.** `DepositComponent.confirm` knows only success or error. After `API-P0-1`, a deposit can come
back `REQUIRES_ACTION` (3-D Secure) or `PROCESSING`, and the UI has no state for either.
The client also sends `metadata` (masked account, holder) that the server shouldn't trust.
After an unknown-outcome error (timeout, 5xx) the deposit may already have gone through, but the UI only shows an
error toast. `IdempotencyKeyService` keeps the key so a retry is safe, but the user isn't told to check before
changing the amount (seen in the WEB-P0-1 verification run).

**Solution.**
- **Deposit states:** model deposit as `idle → submitting → requires_action → processing → succeeded | failed`.
- **3-D Secure:** on `REQUIRES_ACTION`, run the PSP's client SDK action (Stripe.js `handleNextAction` with the returned
  client secret), then wait for the final status.
- **Final status:** get it from the SSE stream (`WEB-P1-3`) or poll `GET /payments/:id` with backoff.
- **Metadata:** drop the client `metadata`; the server derives it.

**Verify.**
- [ ] 3-D Secure test card: the challenge appears, and after approval the wallet balance updates without a reload.
- [ ] Closing the tab mid-challenge leaves a payment the reconciliation job (`API-P1-1`) resolves.

### WEB-P1-2 · Auth tokens are exposed to scripts, and expired sessions look logged in

**Problem.**
- **Readable by scripts:** the access token is kept in `localStorage`, so any XSS can read it.
- **Leaks into logs:** `NotificationService` puts it in the SSE URL (`/stream?token=…`), where proxies and access logs record it.
- **Expired tokens trusted:** `isAuthenticated` trusts any stored token without checking expiry.
- **No refresh:** a 401 just logs out.

**Solution.**
- **Cookie sessions:** `HttpOnly; Secure; SameSite=Lax`, paired with `API-P2-7` refresh sessions.
- **SSE ticket:** a single-use 30-second ticket from `POST /notifications/stream-ticket`.
- **Refresh:** refresh once on 401 before logging out.
- **Session check on startup:** `GET /auth/session` on app start decides whether the user is logged in.

**Verify.**
- [ ] No token in `localStorage`; the SSE URL carries no long-lived token.
- [ ] An expired session redirects to login on first navigation, not after a failed call.
- [ ] A session outlives access-token expiry without re-login.

### WEB-P1-3 · Live notifications stop after the first network blip

**Problem.**
- **No reconnect:** `NotificationService.connectSSE` sets `onerror = disconnectSSE`. One dropped connection ends live
  updates until a page reload.
- **Gaps and duplicates:** events sent while the stream was disconnected are never fetched, and nothing de-duplicates them.

**Solution.**
- **Reconnect:** with exponential backoff and jitter.
- **Catch up:** on reconnect, re-fetch notifications since the last seen ID/time (`Last-Event-ID` support on the API).
- **De-duplicate:** by ID when merging.
- **Disconnect on logout.**

**Verify.**
- [ ] Stopping and restarting the API: the stream reconnects by itself, and notifications created during the gap appear once.

---

## P2

### WEB-P2-1 · Subscriptions are never cleaned up

**Problem.** There are 56 `.subscribe()` calls and zero uses of `takeUntilDestroyed`/`DestroyRef`. Most are one-shot
HTTP calls, but long-lived streams leak, e.g. `ProfileFormHelper.watchFormChanges` subscribes to `valueChanges` and
never unsubscribes, so each profile visit adds another listener.

**Solution.** Use `takeUntilDestroyed(destroyRef)` for every non-HTTP stream (form `valueChanges`, router events,
intervals), and prefer `toSignal` where the value only feeds a template.

**Verify.**
- [ ] Opening and leaving the profile page 10 times, then editing the name, runs `checkIfChanged` once per keystroke, not 10 times.

### WEB-P2-2 · Hand-written types and duplicated services

- **Hand-written types:** `core/interfaces` re-declares backend DTOs by hand and will drift. Generate client types from
  the API's OpenAPI spec (Swagger already exists), e.g. `openapi-typescript`, in a `generate:api` script.
- **Duplicate services:**
  - `bet.service` vs `betting.service`;
  - `admin-api.service` vs `user.service`, which both have `updateWalletStatus` and `updateEmailVerification`.
  Merge each pair.
- **Duplicate interfaces:** `AdminStats` / `DashboardStats` and `DeleteUserResponse` / `DeleteResponse` are identical pairs.

**Verify.** No duplicated service method names. Changing a backend DTO field breaks the client typecheck.

### WEB-P2-3 · Error handling is inconsistent

**Problem.** Some components extract messages by hand (`admin.component.ts`:
`err?.error?.message ?? err?.message ?? …`), while services use `HttpErrorHelper`. Toasts are raised in many places,
and some errors are shown twice or not at all.

**Solution.** One error interceptor normalises API errors (including the validation `errors` array) into the typed
`HttpRequestError` (`core/errors/`, already carries the HTTP status). Components only decide *whether* to show it, and a single place decides *how*.

**Verify.**
- [ ] Every form shows server validation errors next to the right field.
- [ ] No component reads `err.error.message` directly.

### WEB-P2-4 · Parameter DTOs (phase 2 of the client refactor)

Every method takes one DTO, template-called methods included (the backend DTO convention, agreed for the client on
2026-09-22). Do it one feature area at a time: auth → wallet → betting → admin → shared.

**Verify.** No client method takes more than one parameter; build, lint and typecheck pass.

### WEB-P2-5 · Routes and role checks

**Problem.** Routes are flat: every page repeats `canActivate: [roleGuard(...)]`, and role strings (`'ADMIN'`, `'USER'`)
are repeated across routes, guards and components (`isUser` is computed in three components).

**Solution.** Group signed-in pages under one parent route with the guard, and define role sets once
(`STAFF_ROLES` already exists). Add `hasRole`/`isStaff` signals on `AuthService` and use them everywhere.

**Verify.** Role strings appear only in the role constants; navigation behaves as before for each role.

---

## P3

### WEB-P3-1 · No tests

**Problem.** `npm test` only echoes a message.

**Solution.** Add the Angular test runner (Vitest or Karma) and cover the money paths first:
- `CurrencyHelper` (JPY/KWD)
- the deposit/withdraw state machine (`WEB-P1-1`)
- `IdempotencyKeyService` (reuse on unknown outcome, fresh key on success, 4xx, or a changed fingerprint)

Then one Playwright smoke test: log in → deposit → bet.

**Verify.** `npm test -w apps/client` runs in CI and fails when a money-path test breaks.

### WEB-P3-2 · Not reviewed yet

Review these, then turn findings into items or delete this section:
- **Accessibility:** keyboard navigation, focus in modals, contrast in dark mode.
- **Bundle size:** check against Angular budgets, and lazy chunk sizes.
- **Offline and slow networks:** how every page behaves.
