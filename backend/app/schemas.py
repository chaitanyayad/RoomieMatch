from pydantic import BaseModel, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

BRANCHES = [
    "CSE", "ECE", "EEE", "ME", "CE", "BBA", "MBA",
    "BCA", "MCA", "B.Pharm", "B.Arch", "Design", "Law", "Other",
]

INTERESTS = [
    "Gaming", "Music", "Football", "Cricket", "Basketball",
    "Badminton", "Gym/Fitness", "Art & Design", "Movies", "Travel",
    "Cooking", "Reading", "Photography", "Dance", "Other",
]

VEG_OPTIONS = ["veg", "non_veg", "both"]


class UserPublic(BaseModel):
    id: UUID
    name: str
    email: str
    avatar_url: Optional[str] = None
    year: Optional[int] = None
    branch: Optional[str] = None
    hometown: Optional[str] = None
    veg_nonveg: Optional[str] = None
    interests: List[str] = []
    bio: Optional[str] = None
    contact_info: Optional[str] = None
    is_looking: bool
    profile_complete: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    year: Optional[int] = None
    branch: Optional[str] = None
    hometown: Optional[str] = None
    veg_nonveg: Optional[str] = None
    interests: Optional[List[str]] = None
    contact_info: Optional[str] = None
    bio: Optional[str] = None
    is_looking: Optional[bool] = None

    @field_validator("interests")
    @classmethod
    def cap_interests(cls, v):
        if v and len(v) > 6:
            raise ValueError("Pick at most 6 interests")
        return v

    @field_validator("bio")
    @classmethod
    def cap_bio(cls, v):
        if v and len(v) > 200:
            raise ValueError("Bio must be 200 characters or less")
        return v


class RecommendedUser(UserPublic):
    score: int
    match_percent: int


class GoogleAuthRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class AvatarResponse(BaseModel):
    avatar_url: str
