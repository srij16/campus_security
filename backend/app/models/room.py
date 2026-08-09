from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    room_number = Column(String, nullable=False)
    floor = Column(String, nullable=True)

    building = relationship("Building", back_populates="rooms")
    complaints = relationship("Complaint", back_populates="room")
