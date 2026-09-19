# KLH Library Management System — Phase 7

## Student Experience + Smart Library

### Added
- Personalized student reading insights from actual loan history.
- Recommendation API based on the student's borrowing categories, with highly rated fallback titles.
- Student dashboard now shows real monthly borrowing activity, completed/active loan counts, preferred categories, and campus library location.
- Book details now include a physical "Find this book in the library" location panel with floor, section, rack, shelf, and DDC classification when available.
- Existing search/filter/catalog, reservations, fines, circulation, authentication, and library-card features are preserved.

### New API endpoints
- `GET /api/student/insights`
- `GET /api/books/recommended?limit=6`

### Run
```bash
npm install
npm run dev
```

Backend:
```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
