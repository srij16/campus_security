import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.department import Department
from app.models.building import Building
from app.models.room import Room
from app.models.user import User
from app.utils.enums import UserRole
from app.core.security import get_password_hash

def seed_data():
    db = SessionLocal()
    try:
        # 1. Seed Departments
        departments_data = [
            {"name": "Electrical", "description": "Electrical maintenance and equipment services"},
            {"name": "Plumbing", "description": "Plumbing, water leakage, and piping services"},
            {"name": "Civil", "description": "Civil structure, carpentry, masonry, and painting"},
            {"name": "IT", "description": "Network connectivity, wifi, computer labs, AV equipment"},
            {"name": "Housekeeping", "description": "Waste disposal, sanitation, and cleaning services"},
            {"name": "Safety", "description": "Campus safety patrols, hazard prevention, emergency services"}
        ]
        
        seeded_depts = {}
        for dept in departments_data:
            db_dept = db.query(Department).filter(Department.name == dept["name"]).first()
            if not db_dept:
                db_dept = Department(name=dept["name"], description=dept["description"])
                db.add(db_dept)
                db.commit()
                db.refresh(db_dept)
            seeded_depts[dept["name"]] = db_dept.id

        # 2. Seed Buildings and Rooms
        buildings_data = [
            {
                "name": "Science & Technology Block",
                "description": "Main laboratory complex housing natural science departments",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "rooms": ["101 Lab", "102 Lab", "Physics Lab", "Chemistry Lab", "Bio-Tech Lab", "Auditorium"]
            },
            {
                "name": "Dr. Kalam Engineering Wing",
                "description": "Engineering faculty building with lecture theaters and heavy workshops",
                "latitude": 12.9725,
                "longitude": 77.5958,
                "rooms": ["Robotics Lab", "Mech Workshop", "Electrical Room", "Civil Lab", "Room 204 Corridor"]
            },
            {
                "name": "Central Academic Library",
                "description": "4-story knowledge hub with 24/7 reading halls",
                "latitude": 12.9705,
                "longitude": 77.5935,
                "rooms": ["Reference Hall", "Quiet Study Zone", "Digital Archives", "Periodicals Room"]
            },
            {
                "name": "Computer & AI Research Hub",
                "description": "High-speed networking centers and computing labs",
                "latitude": 12.9733,
                "longitude": 77.5966,
                "rooms": ["Server Room", "Coding Lab A", "AI ML Center", "Cybersecurity Hub"]
            },
            {
                "name": "Chancellor & Admin Tower",
                "description": "Executive administration and student affairs offices",
                "latitude": 12.9712,
                "longitude": 77.5975,
                "rooms": ["Main Reception", "Registrar Office", "Finance Wing", "Chancellor Office"]
            },
            {
                "name": "Student Activity & Dining Concourse",
                "description": "Central dining hall and recreation arena",
                "latitude": 12.9695,
                "longitude": 77.5952,
                "rooms": ["Main Cafeteria", "Student Gym", "Recreation Arena"]
            }
        ]

        for bld in buildings_data:
            db_bld = db.query(Building).filter(Building.name == bld["name"]).first()
            if not db_bld:
                db_bld = Building(
                    name=bld["name"],
                    description=bld["description"],
                    latitude=bld["latitude"],
                    longitude=bld["longitude"]
                )
                db.add(db_bld)
                db.commit()
                db.refresh(db_bld)
            
            for rm_num in bld["rooms"]:
                db_rm = db.query(Room).filter(Room.building_id == db_bld.id, Room.room_number == rm_num).first()
                if not db_rm:
                    db_rm = Room(building_id=db_bld.id, room_number=rm_num, floor="Ground Floor")
                    db.add(db_rm)
            db.commit()

        # 3. Seed Default System Users (Admin, Staff, Student) for initial testing/login
        default_users = [
            {
                "name": "System Administrator",
                "email": "admin@campusguardian.com",
                "password": "AdminPassword123",
                "role": UserRole.ADMIN,
                "department_name": None
            },
            {
                "name": "Marcus Cole (Electrical Staff)",
                "email": "elec.staff@campusguardian.com",
                "password": "StaffPassword123",
                "role": UserRole.STAFF,
                "department_name": "Electrical"
            },
            {
                "name": "Sarah Jenkins (Plumbing Staff)",
                "email": "plumb.staff@campusguardian.com",
                "password": "StaffPassword123",
                "role": UserRole.STAFF,
                "department_name": "Plumbing"
            },
            {
                "name": "Alex Rivera (Student)",
                "email": "alex.rivera@campusguardian.com",
                "password": "StudentPassword123",
                "role": UserRole.STUDENT,
                "department_name": None
            }
        ]

        for usr in default_users:
            db_usr = db.query(User).filter(User.email == usr["email"]).first()
            if not db_usr:
                dept_id = seeded_depts.get(usr["department_name"]) if usr["department_name"] else None
                db_usr = User(
                    name=usr["name"],
                    email=usr["email"],
                    password_hash=get_password_hash(usr["password"]),
                    role=usr["role"],
                    department_id=dept_id,
                    is_active=True
                )
                db.add(db_usr)
                db.commit()

        print("Database seeded successfully with Departments, Buildings, Rooms, and default accounts.")
    except Exception as e:
        print(f"Error during seeding: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
