import datetime
import random
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from fastapi import HTTPException, status
from app.models.complaint import Complaint
from app.models.status_history import StatusHistory
from app.models.comment import Comment
from app.models.attachment import Attachment
from app.models.ai_analysis import AIAnalysis
from app.models.building import Building
from app.models.room import Room
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, UpdateStatusRequest
from app.utils.enums import ComplaintStatus, ComplaintPriority, UserRole
from app.services.notification_service import NotificationService

class ComplaintService:
    @staticmethod
    def _generate_complaint_number(db: Session) -> str:
        today_str = datetime.datetime.utcnow().strftime("%Y%m%d")
        # Count complaints created today
        today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        count = db.query(Complaint).filter(Complaint.created_at >= today_start).count()
        seq = count + 1
        return f"CG-{today_str}-{seq:04d}"

    @staticmethod
    def check_duplicates(db: Session, building_id: int, room_id: Optional[int], category: str, hours_window: int = 24) -> list[Complaint]:
        time_limit = datetime.datetime.utcnow() - datetime.timedelta(hours=hours_window)
        query = db.query(Complaint).filter(
            Complaint.status != ComplaintStatus.RESOLVED,
            Complaint.status != ComplaintStatus.CLOSED,
            Complaint.building_id == building_id,
            Complaint.category == category,
            Complaint.created_at >= time_limit
        )
        if room_id is not None:
            query = query.filter(Complaint.room_id == room_id)
        return query.all()

    @staticmethod
    def create_complaint(db: Session, reporter_id: int, complaint_in: ComplaintCreate) -> Complaint:
        # Create complaint
        complaint_number = ComplaintService._generate_complaint_number(db)
        
        # Verify building and room
        building = db.query(Building).filter(Building.id == complaint_in.building_id).first()
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")
        
        if complaint_in.room_id:
            room = db.query(Room).filter(Room.id == complaint_in.room_id, Room.building_id == building.id).first()
            if not room:
                raise HTTPException(status_code=404, detail="Room not found in specified building")

        db_complaint = Complaint(
            complaint_number=complaint_number,
            reporter_id=reporter_id,
            building_id=complaint_in.building_id,
            room_id=complaint_in.room_id,
            title=complaint_in.title,
            description=complaint_in.description,
            category=complaint_in.category,
            priority=complaint_in.priority,
            status=ComplaintStatus.REPORTED,
            ai_confidence=complaint_in.ai_confidence
        )
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)

        # Create initial status history
        history = StatusHistory(
            complaint_id=db_complaint.id,
            old_status=None,
            new_status=ComplaintStatus.REPORTED,
            changed_by=reporter_id,
            comment="Complaint submitted"
        )
        db.add(history)

        # Save AI analysis if provided
        if complaint_in.ai_summary:
            ai_analysis = AIAnalysis(
                complaint_id=db_complaint.id,
                detected_issue=complaint_in.title,
                category=complaint_in.category,
                confidence=complaint_in.ai_confidence,
                summary=complaint_in.ai_summary,
                reasoning="AI structured evaluation during upload"
            )
            db.add(ai_analysis)

        # Create attachment if image is provided
        if complaint_in.imageUrl:
            attachment = Attachment(
                complaint_id=db_complaint.id,
                file_url=complaint_in.imageUrl,
                is_after=False
            )
            db.add(attachment)

        db.commit()
        db.refresh(db_complaint)

        # Send notification to reporter
        NotificationService.create_notification(
            db,
            user_id=reporter_id,
            title="Complaint Submitted",
            message=f"Your complaint {db_complaint.complaint_number} has been submitted successfully."
        )

        # Send notification to admins
        admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
        for admin in admins:
            NotificationService.create_notification(
                db,
                user_id=admin.id,
                title="New Complaint Reported",
                message=f"A new complaint {db_complaint.complaint_number} has been reported."
            )

        return db_complaint

    @staticmethod
    def get_complaints(
        db: Session,
        user: User,
        status_filter: Optional[ComplaintStatus] = None,
        priority_filter: Optional[ComplaintPriority] = None,
        category_filter: Optional[str] = None,
        department_filter: Optional[int] = None,
        building_filter: Optional[int] = None,
        room_filter: Optional[int] = None,
        assigned_staff_filter: Optional[int] = None,
        date_start: Optional[datetime.datetime] = None,
        date_end: Optional[datetime.datetime] = None,
        search_text: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_dir: str = "desc"
    ):
        query = db.query(Complaint)

        # Role-based restriction:
        # Students/Teachers can only see their own complaints
        if user.role in [UserRole.STUDENT, UserRole.TEACHER]:
            query = query.filter(Complaint.reporter_id == user.id)
        # Staff can only see complaints assigned to them or their department
        elif user.role == UserRole.STAFF:
            query = query.filter(
                or_(
                    Complaint.assigned_staff_id == user.id,
                    Complaint.assigned_department_id == user.department_id
                )
            )

        # Filtering
        if status_filter:
            query = query.filter(Complaint.status == status_filter)
        if priority_filter:
            query = query.filter(Complaint.priority == priority_filter)
        if category_filter:
            query = query.filter(Complaint.category == category_filter)
        if department_filter:
            query = query.filter(Complaint.assigned_department_id == department_filter)
        if building_filter:
            query = query.filter(Complaint.building_id == building_filter)
        if room_filter:
            query = query.filter(Complaint.room_id == room_filter)
        if assigned_staff_filter:
            query = query.filter(Complaint.assigned_staff_id == assigned_staff_filter)
        if date_start:
            query = query.filter(Complaint.created_at >= date_start)
        if date_end:
            query = query.filter(Complaint.created_at <= date_end)
        
        if search_text:
            search_pattern = f"%{search_text}%"
            query = query.filter(
                or_(
                    Complaint.title.ilike(search_pattern),
                    Complaint.description.ilike(search_pattern),
                    Complaint.complaint_number.ilike(search_pattern)
                )
            )

        # Sorting
        sort_col = getattr(Complaint, sort_by, Complaint.created_at)
        if sort_dir == "desc":
            query = query.order_by(desc(sort_col))
        else:
            query = query.order_by(sort_col)

        # Pagination
        total = query.count()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        items = query.offset((page - 1) * page_size).limit(page_size).all()

        return items, total, total_pages

    @staticmethod
    def get_complaint_by_id(db: Session, complaint_id: int, user: User) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Verify access rights
        if user.role in [UserRole.STUDENT, UserRole.TEACHER] and complaint.reporter_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this complaint")
        
        return complaint

    @staticmethod
    def assign_staff(db: Session, complaint_id: int, staff_id: int, admin_user: User) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        staff = db.query(User).filter(User.id == staff_id, User.role == UserRole.STAFF).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")

        old_status = complaint.status
        complaint.assigned_staff_id = staff.id
        complaint.assigned_department_id = staff.department_id
        complaint.status = ComplaintStatus.ASSIGNED

        # Record Status History
        history = StatusHistory(
            complaint_id=complaint.id,
            old_status=old_status,
            new_status=ComplaintStatus.ASSIGNED,
            changed_by=admin_user.id,
            comment=f"Assigned to staff: {staff.name}"
        )
        db.add(history)
        db.commit()
        db.refresh(complaint)

        # Send Notifications
        NotificationService.create_notification(
            db,
            user_id=staff.id,
            title="New Assignment",
            message=f"You have been assigned to complaint {complaint.complaint_number}."
        )
        NotificationService.create_notification(
            db,
            user_id=complaint.reporter_id,
            title="Complaint Assigned",
            message=f"Your complaint {complaint.complaint_number} has been assigned to a maintenance engineer."
        )

        return complaint

    @staticmethod
    def update_status(db: Session, complaint_id: int, request: UpdateStatusRequest, user: User) -> Complaint:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Permissions check: Staff can modify assigned complaints, Admins can modify any
        if user.role == UserRole.STAFF and complaint.assigned_staff_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this complaint status")

        old_status = complaint.status
        complaint.status = request.status
        
        if request.status == ComplaintStatus.RESOLVED:
            complaint.resolved_at = datetime.datetime.utcnow()

        # Add repair image if uploaded
        if request.repair_image_url:
            attachment = Attachment(
                complaint_id=complaint.id,
                file_url=request.repair_image_url,
                is_after=True
            )
            db.add(attachment)

        # Record Status History
        history = StatusHistory(
            complaint_id=complaint.id,
            old_status=old_status,
            new_status=request.status,
            changed_by=user.id,
            comment=request.comment or f"Status updated from {old_status.value} to {request.status.value}"
        )
        db.add(history)
        db.commit()
        db.refresh(complaint)

        # Send Notifications
        NotificationService.create_notification(
            db,
            user_id=complaint.reporter_id,
            title="Complaint Status Updated",
            message=f"Complaint {complaint.complaint_number} status updated to {request.status.value}."
        )

        return complaint

    @staticmethod
    def add_comment(db: Session, complaint_id: int, comment_text: str, user: User) -> Comment:
        # Check permission
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        if user.role in [UserRole.STUDENT, UserRole.TEACHER] and complaint.reporter_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to comment on this complaint")

        db_comment = Comment(
            complaint_id=complaint_id,
            user_id=user.id,
            comment=comment_text
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)

        # Notify reporter if staff commented
        if user.role in [UserRole.STAFF, UserRole.ADMIN] and user.id != complaint.reporter_id:
            NotificationService.create_notification(
                db,
                user_id=complaint.reporter_id,
                title="New Comment on Complaint",
                message=f"A staff member commented on your complaint {complaint.complaint_number}."
            )

        return db_comment

    @staticmethod
    def get_comments(db: Session, complaint_id: int, user: User) -> list[Comment]:
        # Check permissions
        ComplaintService.get_complaint_by_id(db, complaint_id, user)
        return db.query(Comment).filter(Comment.complaint_id == complaint_id).order_by(Comment.created_at.asc()).all()

    @staticmethod
    def get_history(db: Session, complaint_id: int, user: User) -> list[StatusHistory]:
        # Check permissions
        ComplaintService.get_complaint_by_id(db, complaint_id, user)
        return db.query(StatusHistory).filter(StatusHistory.complaint_id == complaint_id).order_by(StatusHistory.created_at.asc()).all()

    @staticmethod
    def get_attachments(db: Session, complaint_id: int, user: User) -> list[Attachment]:
        # Check permissions
        ComplaintService.get_complaint_by_id(db, complaint_id, user)
        return db.query(Attachment).filter(Attachment.complaint_id == complaint_id).order_by(Attachment.created_at.asc()).all()
