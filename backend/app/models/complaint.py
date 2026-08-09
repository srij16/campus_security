import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.utils.enums import ComplaintStatus, ComplaintPriority

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String, unique=True, index=True, nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    priority = Column(Enum(ComplaintPriority), default=ComplaintPriority.LOW)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.REPORTED)
    assigned_department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    assigned_staff_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="complaints_reported")
    building = relationship("Building", back_populates="complaints")
    room = relationship("Room", back_populates="complaints")
    assigned_department = relationship("Department", back_populates="complaints")
    assigned_staff = relationship("User", foreign_keys=[assigned_staff_id], back_populates="complaints_assigned")
    
    attachments = relationship("Attachment", back_populates="complaint", cascade="all, delete-orphan")
    ai_analysis = relationship("AIAnalysis", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="complaint", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="complaint", cascade="all, delete-orphan")
