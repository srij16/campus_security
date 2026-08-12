import datetime
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.utils.enums import UserRole, UserStatus

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    auth_user_id = Column(String, unique=True, index=True, nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.PENDING)
    verified_at = Column(DateTime, nullable=True)
    verified_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verification_reason = Column(String, nullable=True)
    
    # Onboarding / Verification details
    student_id = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    course = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    semester = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    document_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    department = relationship("Department", back_populates="users")
    complaints_reported = relationship("Complaint", back_populates="reporter", foreign_keys="[Complaint.reporter_id]")
    complaints_assigned = relationship("Complaint", back_populates="assigned_staff", foreign_keys="[Complaint.assigned_staff_id]")
    comments = relationship("Comment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    
    verified_by = relationship("User", remote_side=[id], backref="verified_users")
