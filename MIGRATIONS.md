# Database migrations

This project uses Flask-Migrate/Alembic.

For a fresh development checkout:

```powershell
flask --app backend/app.py db init
flask --app backend/app.py db migrate -m "initial schema"
flask --app backend/app.py db upgrade
```

For an existing project that already has a schema, create a baseline migration after verifying the database schema, then stamp the database with that revision instead of recreating tables.

Every future model change should follow:

```powershell
flask --app backend/app.py db migrate -m "describe change"
flask --app backend/app.py db upgrade
```
