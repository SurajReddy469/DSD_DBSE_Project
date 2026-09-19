# Phase 10 — Security & Production Hardening

Implemented:
- Short-lived 1-hour JWT access tokens
- 7-day rotating refresh tokens with revocation
- Logout revokes refresh tokens
- Account lockout after 5 failed login attempts for 15 minutes
- Password-change endpoint that revokes existing refresh tokens
- Production SECRET_KEY enforcement
- Role checks remain server-side
- Authentication remains backward-compatible with the existing `token` response field
- Health endpoint reports application environment
- Password-reset tokens remain one-time and 30-minute expiry

## New endpoints
- POST `/api/auth/refresh`
- POST `/api/auth/logout`
- POST `/api/auth/change-password`

## Production environment
Set:
- `APP_ENV=production`
- `SECRET_KEY=<long-random-secret>`
- `DATABASE_URL=<production-database-url>`
- `CORS_ORIGINS=<frontend-origin>`

Do not commit `.env` files or secrets.
