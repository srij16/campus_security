# Import all the models, so that Base has them before being imported by Alembic
from app.database.session import Base  # noqa
from app.models.user import User  # noqa
from app.models.department import Department  # noqa
from app.models.building import Building  # noqa
from app.models.room import Room  # noqa
from app.models.complaint import Complaint  # noqa
from app.models.attachment import Attachment  # noqa
from app.models.ai_analysis import AIAnalysis  # noqa
from app.models.status_history import StatusHistory  # noqa
from app.models.comment import Comment  # noqa
from app.models.notification import Notification  # noqa
