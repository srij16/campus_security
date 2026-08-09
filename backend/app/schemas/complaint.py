from pydantic import BaseModel
from typing import Optional, List
import datetime
from app.utils.enums import ComplaintStatus, ComplaintPriority
from app.schemas.user import UserResponse
from app.schemas.building import BuildingResponse, RoomResponse
from app.schemas.department import DepartmentResponse

class AttachmentResponse(BaseModel):
    id: int
    complaint_id: int
    file_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    is_after: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AIAnalysisResponse(BaseModel):
    id: int
    detected_issue: Optional[str] = None
    category: Optional[str] = None
    suggested_department: Optional[str] = None
    suggested_priority: Optional[str] = None
    confidence: Optional[float] = None
    summary: Optional[str] = None
    reasoning: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class StatusHistoryResponse(BaseModel):
    id: int
    old_status: Optional[ComplaintStatus] = None
    new_status: ComplaintStatus
    changed_by: Optional[int] = None
    user: Optional[UserResponse] = None
    comment: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    id: int
    complaint_id: int
    user_id: int
    user: UserResponse
    comment: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    comment: str

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: ComplaintPriority
    building_id: int
    room_id: Optional[int] = None
    imageUrl: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_summary: Optional[str] = None

class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[ComplaintPriority] = None
    status: Optional[ComplaintStatus] = None
    assigned_department_id: Optional[int] = None
    assigned_staff_id: Optional[int] = None

class AssignStaffRequest(BaseModel):
    staff_id: int

class UpdateStatusRequest(BaseModel):
    status: ComplaintStatus
    comment: Optional[str] = None
    repair_image_url: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    complaint_number: str
    reporter_id: int
    reporter: UserResponse
    building_id: int
    building: BuildingResponse
    room_id: Optional[int] = None
    room: Optional[RoomResponse] = None
    title: str
    description: str
    category: str
    priority: ComplaintPriority
    status: ComplaintStatus
    assigned_department_id: Optional[int] = None
    assigned_department: Optional[DepartmentResponse] = None
    assigned_staff_id: Optional[int] = None
    assigned_staff: Optional[UserResponse] = None
    ai_confidence: Optional[float] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    
    attachments: List[AttachmentResponse] = []
    ai_analysis: Optional[AIAnalysisResponse] = None

    class Config:
        from_attributes = True

class PaginatedComplaints(BaseModel):
    items: List[ComplaintResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
