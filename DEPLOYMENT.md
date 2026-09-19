# Phase 11 — Production Deployment

## Architecture

React/Vite frontend → Flask REST API → SQLAlchemy → MySQL 8.4

The Bachupally library application keeps demo seeding disabled in production. Use migrations for schema changes and environment variables for secrets.

## Local MySQL with Docker

1. Install Docker Desktop.
2. Change all example passwords in `docker-compose.yml`.
3. Start MySQL and API:

```powershell
docker compose up -d --build
```

4. Apply migrations:

```powershell
docker compose exec backend flask --app app.py db upgrade
```

5. Check:

```text
http://localhost:5000/api/health
```

## Existing local SQLite data

Do not point a production MySQL instance at the SQLite file. Export/import business data deliberately and verify counts before switching users to production.

## Production checklist

- Replace every placeholder secret.
- Use HTTPS at the reverse proxy.
- Restrict `CORS_ORIGINS` to the deployed frontend origin.
- Back up MySQL regularly.
- Run `flask db upgrade` during deployment.
- Never enable development debug mode in production.
- Do not use demo credentials in production.
