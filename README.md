# KLH Library Management System — Final Release

A full-stack library management application tailored for the **KLH Bachupally Campus**.

## Stack
- React + TypeScript + Vite + Tailwind CSS
- Flask REST API
- SQLAlchemy
- MySQL 8 / PyMySQL for production
- SQLite for local development
- Flask-Migrate / Alembic
- JWT authentication
- Gunicorn + Docker Compose for production

## Roles
- **Student:** catalog, recommendations, library card, loans, renewals, reservations, fines, notifications, profile.
- **Librarian:** circulation desk, barcode/RFID-style workflow, inventory, members, analytics and reports.
- **Admin:** users, books, categories, settings, analytics, reports and audit logs.

## Quick start
### Frontend
```bash
npm ci
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Production
Configure `APP_ENV`, `SECRET_KEY`, `DATABASE_URL`, and `CORS_ORIGINS`. Use MySQL 8+, migrations and Gunicorn. See `DEPLOYMENT.md` and `MIGRATIONS.md`.

## Demo accounts — local development only
- `student@klh.edu.in` / `password`
- `librarian@klh.edu.in` / `password`
- `admin@klh.edu.in` / `password`

Do not use demo credentials in production.

## Final verification
Run:

```bash
python scripts/preflight.py
npm ci
npm run build
```

Then verify `GET /api/health` returns an `ok` status.

See `QA_CHECKLIST.md` for the complete end-to-end test plan.

## RFID scope
The application provides the software workflow for RFID/barcode-style circulation. It does not claim a live connection to KLH physical RFID readers, gates, kiosks, or private university identity systems. Hardware integration requires the appropriate campus equipment, vendor APIs and authorization.
