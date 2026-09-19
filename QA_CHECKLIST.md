# Final QA Checklist

## Automated/static checks
- [x] Backend Python syntax compiles with `python -m py_compile backend/app.py`.
- [x] Production configuration files are present.
- [x] Docker Compose configuration is present.
- [x] Migration documentation is present.
- [x] Frontend lockfile is present.

## Required local verification
Run from the project root:

```bash
npm ci
npm run build
```

Then run the backend and verify:

```text
GET http://localhost:5000/api/health
```

Expected JSON status is `ok`.

## End-to-end smoke tests
### Student
- Register with a valid KLH email.
- Login with email and University ID.
- Open digital Library Card.
- Search and open a book.
- Reserve an unavailable book.
- View active loans and history.
- Renew an eligible loan.
- View fines and notifications.
- Change password and verify old refresh sessions are revoked.

### Librarian
- Login as librarian.
- Open Smart Circulation.
- Identify a student by Library Card ID.
- Identify a physical copy by barcode/accession number.
- Issue a copy.
- Return the same copy.
- Verify inventory and loan state changes.
- Run analytics and export a CSV report.

### Admin
- Login as admin.
- Review users, books, categories and settings.
- Review analytics.
- Review audit logs.
- Export a report.
- Verify student-only endpoints reject admin-only access and vice versa where applicable.

### Security
- Invalid login returns an error.
- Five failed attempts trigger temporary lockout.
- Suspended users cannot login.
- Expired/revoked refresh tokens are rejected.
- Students cannot call admin/librarian protected endpoints.
- Production refuses to start with the default secret key.

## Known environment limitation during packaging
The packaging environment had an incomplete `node_modules` tree, so its local `npm run build` reported missing `vite/client` and Node type definitions. The project contains the required versions in `package.json` and `package-lock.json`; run `npm ci` on the target Windows machine before final build verification.
