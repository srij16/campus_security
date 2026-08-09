import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.complaint import Complaint
from app.models.building import Building
from app.models.department import Department
from app.utils.enums import ComplaintStatus, ComplaintPriority

class AnalyticsService:
    @staticmethod
    def get_overview_stats(db: Session) -> dict:
        total = db.query(Complaint).count()
        open_c = db.query(Complaint).filter(
            Complaint.status != ComplaintStatus.RESOLVED,
            Complaint.status != ComplaintStatus.CLOSED
        ).count()
        resolved = db.query(Complaint).filter(Complaint.status == ComplaintStatus.RESOLVED).count()
        critical = db.query(Complaint).filter(Complaint.priority == ComplaintPriority.CRITICAL).count()

        # Calculate average resolution time (in hours)
        resolved_complaints = db.query(Complaint).filter(
            Complaint.status == ComplaintStatus.RESOLVED,
            Complaint.resolved_at.isnot(None)
        ).all()

        avg_hours = None
        if resolved_complaints:
            total_seconds = sum((c.resolved_at - c.created_at).total_seconds() for c in resolved_complaints)
            avg_hours = round(total_seconds / 3600 / len(resolved_complaints), 2)

        # Time filters
        now = datetime.datetime.utcnow()
        week_start = now - datetime.timedelta(days=7)
        month_start = now - datetime.timedelta(days=30)

        this_week = db.query(Complaint).filter(Complaint.created_at >= week_start).count()
        this_month = db.query(Complaint).filter(Complaint.created_at >= month_start).count()

        return {
            "total_complaints": total,
            "open_complaints": open_c,
            "resolved_complaints": resolved,
            "critical_complaints": critical,
            "average_resolution_time_hours": avg_hours,
            "complaints_this_week": this_week,
            "complaints_this_month": this_month
        }

    @staticmethod
    def get_by_category(db: Session) -> list[dict]:
        results = db.query(
            Complaint.category,
            func.count(Complaint.id).label("count")
        ).group_by(Complaint.category).order_by(desc("count")).all()
        return [{"name": r[0], "count": r[1]} for r in results]

    @staticmethod
    def get_by_department(db: Session) -> list[dict]:
        results = db.query(
            Department.name,
            func.count(Complaint.id).label("count")
        ).join(Complaint, Complaint.assigned_department_id == Department.id).group_by(Department.name).order_by(desc("count")).all()
        return [{"name": r[0], "count": r[1]} for r in results]

    @staticmethod
    def get_by_building(db: Session) -> list[dict]:
        results = db.query(
            Building.name,
            func.count(Complaint.id).label("count")
        ).join(Complaint, Complaint.building_id == Building.id).group_by(Building.name).order_by(desc("count")).all()
        return [{"name": r[0], "count": r[1]} for r in results]

    @staticmethod
    def get_by_priority(db: Session) -> list[dict]:
        results = db.query(
            Complaint.priority,
            func.count(Complaint.id).label("count")
        ).group_by(Complaint.priority).all()
        return [{"name": r[0].value, "count": r[1]} for r in results]

    @staticmethod
    def get_trends(db: Session) -> list[dict]:
        # Return complaints grouped by day for the last 30 days
        limit_date = datetime.datetime.utcnow() - datetime.timedelta(days=30)
        results = db.query(
            func.date(Complaint.created_at).label("date"),
            func.count(Complaint.id).label("count")
        ).filter(Complaint.created_at >= limit_date).group_by("date").order_by("date").all()
        return [{"date": str(r[0]), "count": r[1]} for r in results]

    @staticmethod
    def get_resolution_times(db: Session) -> list[dict]:
        # Return average resolution time by category
        resolved = db.query(Complaint).filter(
            Complaint.status == ComplaintStatus.RESOLVED,
            Complaint.resolved_at.isnot(None)
        ).all()
        
        category_data = {}
        for c in resolved:
            hours = (c.resolved_at - c.created_at).total_seconds() / 3600
            category_data.setdefault(c.category, []).append(hours)

        return [
            {"category": cat, "avg_hours": round(sum(hours_list) / len(hours_list), 2)}
            for cat, hours_list in category_data.items()
        ]

    @staticmethod
    def get_problem_hotspots(db: Session) -> list[dict]:
        # Building hotspots with coordinates
        results = db.query(
            Building.name,
            Building.latitude,
            Building.longitude,
            func.count(Complaint.id).label("count")
        ).join(Complaint, Complaint.building_id == Building.id).group_by(Building.id).order_by(desc("count")).all()
        
        return [
            {
                "building_name": r[0],
                "count": r[3],
                "coordinates": [r[1], r[2]] if r[1] is not None and r[2] is not None else None
            }
            for r in results
        ]
