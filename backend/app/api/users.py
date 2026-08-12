from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user, RoleChecker
from app.schemas.user import UserResponse, UserVerifyRequest, UserRoleUpdateRequest
from app.models.user import User
from app.models.audit_log import AuditLog
from app.utils.enums import UserRole, UserStatus
import datetime

router = APIRouter(prefix="/users", tags=["Users"])

admin_required = RoleChecker([UserRole.ADMIN])

def check_last_admin_safety(db: Session, user_id_to_modify: int):
    target_user = db.query(User).filter(User.id == user_id_to_modify).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if target_user.role == UserRole.ADMIN:
        # Count other active, non-suspended, non-rejected admins
        active_admins_count = db.query(User).filter(
            User.role == UserRole.ADMIN,
            User.is_active == True,
            User.status == UserStatus.VERIFIED,
            User.id != user_id_to_modify
        ).count()
        if active_admins_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify, suspend, or change the role of the last active Admin user."
            )

def log_audit(db: Session, actor_id: int, action: str, entity_type: str, entity_id: int, metadata: dict = None):
    audit = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=metadata
    )
    db.add(audit)
    db.commit()

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).all()

@router.get("/staff", response_model=list[UserResponse])
def get_staff(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).filter(User.role == UserRole.STAFF).all()

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    # format audit logs with actor name
    return [
        {
            "id": log.id,
            "actor_id": log.actor_id,
            "actor_name": log.actor.name if log.actor else "System",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "metadata": log.metadata_json,
            "created_at": log.created_at
        }
        for log in logs
    ]

from app.schemas.user import UserResponse, UserVerifyRequest, UserRoleUpdateRequest, UserOnboardRequest
from app.models.notification import Notification

@router.post("/onboard", response_model=UserResponse)
def onboard_user(
    req: UserOnboardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.status == UserStatus.VERIFIED:
        raise HTTPException(status_code=400, detail="User is already verified.")
    if current_user.status == UserStatus.SUSPENDED:
        raise HTTPException(status_code=400, detail="Suspended user cannot onboard.")
    if req.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Cannot request admin role.")
        
    current_user.role = req.role
    current_user.department_id = req.department_id
    current_user.student_id = req.student_id
    current_user.employee_id = req.employee_id
    current_user.designation = req.designation
    current_user.course = req.course
    current_user.year = req.year
    current_user.semester = req.semester
    current_user.phone = req.phone
    current_user.document_url = req.document_url
    
    current_user.status = UserStatus.PENDING
    db.commit()
    db.refresh(current_user)
    
    log_audit(
        db,
        actor_id=current_user.id,
        action="USER_VERIFICATION_SUBMITTED",
        entity_type="User",
        entity_id=current_user.id,
        metadata={"role_requested": req.role.value}
    )
    
    notif = Notification(
        user_id=current_user.id,
        title="Verification Submitted",
        message=f"Your verification request for role {req.role.value} has been submitted.",
        is_read=False
    )
    db.add(notif)
    db.commit()
    
    return current_user

@router.post("/{user_id}/verify", response_model=UserResponse)
def verify_user(
    user_id: int,
    req: UserVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if req.status == UserStatus.SUSPENDED or req.status == UserStatus.REJECTED:
        check_last_admin_safety(db, user_id)
        
    old_status = user.status
    user.status = req.status
    user.verification_reason = req.reason
    user.verified_at = datetime.datetime.utcnow()
    user.verified_by_id = current_user.id
    
    db.commit()
    db.refresh(user)
    
    # Map status to audit action
    action = f"VERIFY_STATUS_{req.status.value}"
    if req.status == UserStatus.VERIFIED:
        action = "USER_VERIFIED"
    elif req.status == UserStatus.REJECTED:
        action = "USER_VERIFICATION_REJECTED"
        if not req.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required.")
    elif req.status == UserStatus.SUSPENDED:
        action = "USER_SUSPENDED"
    elif req.status == UserStatus.PENDING and old_status == UserStatus.SUSPENDED:
        action = "USER_REACTIVATED"
        
    log_audit(
        db,
        actor_id=current_user.id,
        action=action,
        entity_type="User",
        entity_id=user.id,
        metadata={"reason": req.reason}
    )
    
    # Notify user
    notif_msg = ""
    notif_title = ""
    if req.status == UserStatus.VERIFIED:
        notif_title = "Verification Approved"
        notif_msg = "Your Campus Guardian account has been verified."
    elif req.status == UserStatus.REJECTED:
        notif_title = "Verification Rejected"
        notif_msg = f"Your Campus Guardian verification has been rejected. Reason: {req.reason}"
    elif req.status == UserStatus.SUSPENDED:
        notif_title = "Account Suspended"
        notif_msg = f"Your account has been suspended. Reason: {req.reason}"
        
    if notif_title:
        notif = Notification(
            user_id=user.id,
            title=notif_title,
            message=notif_msg,
            is_read=False
        )
        db.add(notif)
        db.commit()
        
    return user

@router.post("/{user_id}/role", response_model=UserResponse)
def change_role(
    user_id: int,
    req: UserRoleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == UserRole.ADMIN and req.role != UserRole.ADMIN:
        check_last_admin_safety(db, user_id)
        
    old_role = user.role
    user.role = req.role
    db.commit()
    db.refresh(user)
    
    log_audit(
        db,
        actor_id=current_user.id,
        action="ROLE_CHANGED",
        entity_type="User",
        entity_id=user.id,
        metadata={"old_role": old_role.value, "new_role": req.role.value}
    )
    
    return user


