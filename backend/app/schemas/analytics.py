from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class OverviewStats(BaseModel):
    total_complaints: int
    open_complaints: int
    resolved_complaints: int
    critical_complaints: int
    average_resolution_time_hours: Optional[float] = None
    complaints_this_week: int
    complaints_this_month: int

class DistributionItem(BaseModel):
    name: str
    count: int

class TrendItem(BaseModel):
    date: str
    count: int

class ResolutionTimeItem(BaseModel):
    category: str
    avg_hours: float

class HotspotItem(BaseModel):
    building_name: str
    count: int
    coordinates: Optional[List[float]] = None
