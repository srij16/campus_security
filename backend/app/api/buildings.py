from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user, RoleChecker
from app.schemas.building import BuildingResponse, BuildingCreate, RoomResponse, RoomCreate
from app.models.building import Building
from app.models.room import Room
from app.models.user import User
from app.utils.enums import UserRole

router = APIRouter(prefix="/buildings", tags=["Buildings"])

admin_only = RoleChecker([UserRole.ADMIN])

@router.get("/", response_model=list[BuildingResponse])
def get_buildings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Building).all()

@router.post("/", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(building_in: BuildingCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    db_building = Building(
        name=building_in.name,
        description=building_in.description,
        latitude=building_in.latitude,
        longitude=building_in.longitude
    )
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building

@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(room_in: RoomCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    # Check if building exists
    building = db.query(Building).filter(Building.id == room_in.building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
        
    db_room = Room(
        building_id=room_in.building_id,
        room_number=room_in.room_number,
        floor=room_in.floor
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room
