from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user, RoleChecker
from app.schemas.analytics import (
    OverviewStats, DistributionItem, TrendItem, ResolutionTimeItem, HotspotItem
)
from app.services.analytics_service import AnalyticsService
from app.models.user import User
from app.utils.enums import UserRole

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Admins and Staff can view analytics
analytics_viewers = RoleChecker([UserRole.ADMIN, UserRole.STAFF])

@router.get("/overview", response_model=OverviewStats)
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_overview_stats(db)

@router.get("/complaints-by-category", response_model=list[DistributionItem])
def get_by_category(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_by_category(db)

@router.get("/complaints-by-department", response_model=list[DistributionItem])
def get_by_department(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_by_department(db)

@router.get("/complaints-by-building", response_model=list[DistributionItem])
def get_by_building(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_by_building(db)

@router.get("/complaints-by-priority", response_model=list[DistributionItem])
def get_by_priority(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_by_priority(db)

@router.get("/complaint-trends", response_model=list[TrendItem])
def get_trends(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_trends(db)

@router.get("/resolution-time", response_model=list[ResolutionTimeItem])
def get_resolution_time(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_resolution_times(db)

@router.get("/problem-hotspots", response_model=list[HotspotItem])
def get_problem_hotspots(db: Session = Depends(get_db), current_user: User = Depends(analytics_viewers)):
    return AnalyticsService.get_problem_hotspots(db)
