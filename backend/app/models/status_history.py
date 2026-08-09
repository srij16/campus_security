import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.utils.enums import ComplaintStatus

class StatusHistory(Base):
    __tablename__ = "status_histories"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    old_status = Column(Enum(ComplaintStatus), nullable=True)
    new_status = Column(Enum(ComplaintStatus), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="status_history")
    user = relationship("User")
