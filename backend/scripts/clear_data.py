import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.session import SessionLocal
from app.models.complaint import Complaint
from app.models.status_history import StatusHistory
from app.models.comment import Comment
from app.models.attachment import Attachment
from app.models.ai_analysis import AIAnalysis
from app.models.notification import Notification

def clear_data():
    db = SessionLocal()
    try:
        print("Clearing transactional data from database...")
        
        # Delete in order of dependencies (child to parent)
        num_history = db.query(StatusHistory).delete()
        print(f"Deleted {num_history} status history records.")
        
        num_comments = db.query(Comment).delete()
        print(f"Deleted {num_comments} comment records.")
        
        num_attachments = db.query(Attachment).delete()
        print(f"Deleted {num_attachments} attachment records.")
        
        num_ai = db.query(AIAnalysis).delete()
        print(f"Deleted {num_ai} AI analysis records.")
        
        num_notifications = db.query(Notification).delete()
        print(f"Deleted {num_notifications} notification records.")
        
        num_complaints = db.query(Complaint).delete()
        print(f"Deleted {num_complaints} complaint records.")
        
        db.commit()
        print("Database cleared successfully!")
    except Exception as e:
        print(f"Error during clearing: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_data()
