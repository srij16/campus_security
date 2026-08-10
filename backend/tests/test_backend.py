import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.dependencies import get_db
from app.database.session import Base
from app.utils.enums import UserRole, ComplaintStatus, ComplaintPriority

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override database dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def run_migrations():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login():
    # 1. Register User
    reg_response = client.post(
        "/api/auth/register",
        json={
            "name": "Test Student",
            "email": "student@test.com",
            "password": "Password123",
            "role": "STUDENT"
        }
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "student@test.com"

    # 2. Login User
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "student@test.com",
            "password": "Password123"
        }
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data

def test_verify_user_endpoints():
    # 1. Register Student
    reg_response = client.post(
        "/api/auth/register",
        json={
            "name": "Alex Rivera",
            "email": "alex.rivera@test.com",
            "password": "StudentPassword123",
            "role": "STUDENT"
        }
    )
    assert reg_response.status_code == 201
    student_id = reg_response.json()["user"]["id"]
    
    # 2. Register Admin
    reg_admin = client.post(
        "/api/auth/register",
        json={
            "name": "Admin",
            "email": "admin@test.com",
            "password": "AdminPassword123",
            "role": "ADMIN"
        }
    )
    assert reg_admin.status_code == 201
    admin_token = reg_admin.json()["access_token"]
    admin_user_id = reg_admin.json()["user"]["id"]
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Make the admin verified so they can perform admin tasks
    # (By default all users start PENDING, so we manually verify the test admin in db or by endpoint)
    # Since we need a verified admin to verify, and we registered one, let's verify him first
    # In tests, Base.metadata.create_all is used, so we can verify the admin
    from app.database.session import SessionLocal
    from app.models.user import User
    from app.utils.enums import UserStatus
    db = SessionLocal()
    try:
        admin_db = db.query(User).filter(User.id == admin_user_id).first()
        if admin_db:
            admin_db.status = UserStatus.VERIFIED
            db.commit()
    finally:
        db.close()
        
    # Approve student
    verify_response = client.post(
        f"/api/users/{student_id}/verify",
        headers=headers,
        json={"status": "VERIFIED", "reason": "Verified by test admin"}
    )
    assert verify_response.status_code == 200
    assert verify_response.json()["status"] == "VERIFIED"
    
    # Get audit logs
    audit_response = client.get("/api/users/audit-logs", headers=headers)
    assert audit_response.status_code == 200
    assert len(audit_response.json()) > 0

