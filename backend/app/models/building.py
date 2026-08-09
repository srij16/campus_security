from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database.session import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    rooms = relationship("Room", back_populates="building", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="building")
