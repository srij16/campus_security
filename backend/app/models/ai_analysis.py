import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    detected_issue = Column(String, nullable=True)
    category = Column(String, nullable=True)
    suggested_department = Column(String, nullable=True)
    suggested_priority = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    summary = Column(String, nullable=True)
    reasoning = Column(String, nullable=True)
    raw_output = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="ai_analysis")
