from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user, RoleChecker
from app.schemas.department import DepartmentResponse, DepartmentCreate, DepartmentUpdate
from app.models.department import Department
from app.models.user import User
from app.utils.enums import UserRole

router = APIRouter(prefix="/departments", tags=["Departments"])

# Admin check dependency
admin_only = RoleChecker([UserRole.ADMIN])

@router.get("/", response_model=list[DepartmentResponse])
def get_departments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Department).all()

@router.get("/{id}", response_model=DepartmentResponse)
def get_department(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    db_dept = Department(name=dept_in.name, description=dept_in.description)
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.patch("/{id}", response_model=DepartmentResponse)
def update_department(id: int, dept_in: DepartmentUpdate, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    db_dept = db.query(Department).filter(Department.id == id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    if dept_in.name is not None:
        db_dept.name = dept_in.name
    if dept_in.description is not None:
        db_dept.description = dept_in.description
        
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.delete("/{id}")
def delete_department(id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    db_dept = db.query(Department).filter(Department.id == id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_dept)
    db.commit()
    return {"success": True, "message": "Department deleted successfully"}
