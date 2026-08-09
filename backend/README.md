# Campus Guardian Backend

This is the production-ready FastAPI backend for the **Campus Guardian** platform, backed by a PostgreSQL database and integrated with Google Gemini Vision API for issue classification and Cloudinary for image hosting.

## Requirements
* Python 3.12+
* PostgreSQL database instance (or Supabase)

## Local Development Setup

### 1. Create a Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On Unix/macOS
```

### 2. Install Package Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file under the `backend/` directory (you can copy `.env.example`).
Important variables:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.moppuikcjqbqkppanvfj.supabase.co:5432/postgres
JWT_SECRET_KEY=supersecretjwtkeythatisverylongandsecuretoavoiderrors
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@tvupy9qd
```

### 4. Run Alembic Migrations
Apply the migrations to set up the database tables:
```bash
alembic upgrade head
```

### 5. Seed Reference Data
Populate the database with initial Departments, Buildings, Rooms, and default login credentials:
```bash
python scripts/seed_reference_data.py
```

### 6. Run the Application
Start the FastAPI development server:
```bash
uvicorn app.main:app --reload
```

The API docs (Swagger OpenAPI) will be available at:
* **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Default Seeded Accounts
You can log in or test the API using the following seeded accounts:
* **Admin**: `admin@campusguardian.com` / `AdminPassword123`
* **Student**: `alex.rivera@campusguardian.com` / `StudentPassword123`
* **Electrical Staff**: `elec.staff@campusguardian.com` / `StaffPassword123`
* **Plumbing Staff**: `plumb.staff@campusguardian.com` / `StaffPassword123`
