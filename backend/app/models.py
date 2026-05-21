import uuid
from sqlalchemy import Column, String, Integer, Boolean, ARRAY, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    branch = Column(String, nullable=True)
    hometown = Column(String, nullable=True)
    veg_nonveg = Column(String, nullable=True)
    interests = Column(ARRAY(String), default=[], nullable=True)
    contact_info = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    is_looking = Column(Boolean, default=True, nullable=False)
    profile_complete = Column(Boolean, default=False, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"))
