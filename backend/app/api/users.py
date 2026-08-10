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
        
    user.status = req.status
    user.verification_reason = req.reason
    user.verified_at = datetime.datetime.utcnow()
    user.verified_by_id = current_user.id
    
    db.commit()
    db.refresh(user)
    
    log_audit(
        db,
        actor_id=current_user.id,
        action=f"VERIFY_STATUS_{req.status.value}",
        entity_type="User",
        entity_id=user.id,
        metadata={"reason": req.reason}
    )
    
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
        
    # If the user is currently an admin and is being changed to something else, check safety
    if user.role == UserRole.ADMIN and req.role != UserRole.ADMIN:
        check_last_admin_safety(db, user_id)
        
    old_role = user.role
    user.role = req.role
    db.commit()
    db.refresh(user)
    
    log_audit(
        db,
        actor_id=current_user.id,
        action="CHANGE_ROLE",
        entity_type="User",
        entity_id=user.id,
        metadata={"old_role": old_role.value, "new_role": req.role.value}
    )
    
    return user

