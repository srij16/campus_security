from pydantic import BaseModel
from typing import Optional, List

class RoomBase(BaseModel):
    room_number: str
    floor: Optional[str] = None

class RoomCreate(RoomBase):
    building_id: int

class RoomResponse(RoomBase):
    id: int
    building_id: int

    class Config:
        from_attributes = True

class BuildingBase(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class BuildingCreate(BuildingBase):
    pass

class BuildingResponse(BuildingBase):
    id: int
    rooms: List[RoomResponse] = []

    class Config:
        from_attributes = True
