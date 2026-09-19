@echo off
set FLASK_APP=app.py
flask db upgrade
if errorlevel 1 exit /b 1
echo Database migrations applied.
