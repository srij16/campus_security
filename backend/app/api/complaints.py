from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import datetime
from app.core.dependencies import get_db, get_current_user, RoleChecker
from app.schemas.complaint import (
    ComplaintResponse, ComplaintCreate, ComplaintUpdate, PaginatedComplaints,
    AssignStaffRequest, UpdateStatusRequest, CommentResponse, CommentCreate,
    StatusHistoryResponse, AttachmentResponse
)
from app.services.complaint_service import ComplaintService
from app.models.user import User
from app.models.complaint import Complaint
from app.utils.enums import ComplaintStatus, ComplaintPriority, UserRole

router = APIRouter(prefix="/complaints", tags=["Complaints"])

admin_only = RoleChecker([UserRole.ADMIN])

@router.get("/check-duplicate", response_model=list[ComplaintResponse])
def check_duplicate(
    building_id: int,
    category: str,
    room_id: Optional[int] = None,
    hours_window: int = Query(24, description="Recent time window in hours"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ComplaintService.check_duplicates(db, building_id, room_id, category, hours_window)

@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ComplaintService.create_complaint(db, current_user.id, complaint_in)

@router.get("/", response_model=PaginatedComplaints)
def get_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    status: Optional[ComplaintStatus] = None,
    priority: Optional[ComplaintPriority] = None,
    category: Optional[str] = None,
    department_id: Optional[int] = None,
    building_id: Optional[int] = None,
    room_id: Optional[int] = None,
    assigned_staff_id: Optional[int] = None,
    date_start: Optional[datetime.datetime] = None,
    date_end: Optional[datetime.datetime] = None,
    search_text: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items, total, total_pages = ComplaintService.get_complaints(
        db, current_user, status, priority, category, department_id,
        building_id, room_id, assigned_staff_id, date_start, date_end,
        search_text, page, page_size, sort_by, sort_dir
    )
    return PaginatedComplaints(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ComplaintService.get_complaint_by_id(db, id, current_user)

@router.patch("/{id}", response_model=ComplaintResponse)
def update_complaint(
    id: int,
    complaint_in: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only Admin can update fields generally via PATCH
    admin_only(current_user)
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    for field, value in complaint_in.model_dump(exclude_unset=True).items():
        setattr(complaint, field, value)
        
    db.commit()
    db.refresh(complaint)
    return complaint

@router.delete("/{id}")
def delete_complaint(id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db.delete(complaint)
    db.commit()
    return {"success": True, "message": "Complaint deleted successfully"}

@router.post("/{id}/assign", response_model=ComplaintResponse)
def assign_complaint(
    id: int,
    req: AssignStaffRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    return ComplaintService.assign_staff(db, id, req.staff_id, current_user)

@router.post("/{id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    id: int,
    req: UpdateStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ComplaintService.update_status(db, id, req, current_user)

@router.post("/{id}/comments", response_model=CommentResponse)
def add_comment(
    id: int,
    req: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ComplaintService.add_comment(db, id, req.comment, current_user)

@router.get("/{id}/comments", response_model=list[CommentResponse])
def get_comments(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ComplaintService.get_comments(db, id, current_user)

@router.get("/{id}/history", response_model=list[StatusHistoryResponse])
def get_history(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ComplaintService.get_history(db, id, current_user)

@router.get("/{id}/attachments", response_model=list[AttachmentResponse])
def get_attachments(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ComplaintService.get_attachments(db, id, current_user)
