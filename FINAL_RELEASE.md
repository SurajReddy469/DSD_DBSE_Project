# KLH Library Management System — Final Release

## Project status
Feature-complete release for the KLH Bachupally Campus library-management workflow.

### Implemented areas
- KLH Bachupally branding and campus identity
- Student, librarian and admin roles
- University-email authentication
- JWT access/refresh authentication
- Password reset/change and account lockout
- Digital library cards
- Book catalog and physical copy management
- ISBN, accession number and barcode tracking
- RFID/barcode circulation workflow
- Issue, return and renewal
- Reservations and queue handling
- Automatic fines and overdue processing
- Notifications and notification preferences
- Student recommendations and borrowing insights
- Librarian/admin analytics
- CSV reports
- Audit logging
- MySQL + PyMySQL production support
- Flask-Migrate/Alembic migrations
- Gunicorn production server
- Docker Compose deployment configuration
- Environment-based production configuration

## Important scope note
The application provides the software workflow for RFID/barcode operations. It is not connected to KLH's physical RFID readers, gates, kiosks, or private university identity systems. Hardware/vendor integration requires campus infrastructure and credentials.

## Local development
### Frontend
```bash
npm install
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

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Production
Use MySQL 8+, Flask-Migrate, Gunicorn, HTTPS, a strong `SECRET_KEY`, and an explicit `CORS_ORIGINS` value. See `DEPLOYMENT.md` and `MIGRATIONS.md`.

## Demo accounts
These are for local development only:

- student@klh.edu.in / password
- librarian@klh.edu.in / password
- admin@klh.edu.in / password

Do not use these credentials in production.
