# KLH Library Backend

## Development

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Development uses SQLite by default and automatically seeds demo data.

## MySQL 8 production

Create a database and application user, then set:

```text
APP_ENV=production
SECRET_KEY=<long-random-secret>
DATABASE_URL=mysql+pymysql://klh_library:<password>@<host>:3306/klh_library
CORS_ORIGINS=https://your-frontend.example
```

Apply schema migrations before starting the API:

```powershell
flask --app app.py db upgrade
```

Start with Gunicorn:

```powershell
gunicorn -w 3 -b 0.0.0.0:5000 app:app
```

Production does not auto-create tables or seed demo users.
