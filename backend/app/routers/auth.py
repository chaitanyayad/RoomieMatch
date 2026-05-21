from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import verify_google_token, create_access_token
from app.database import get_db
from app.models import User
from app.schemas import AuthResponse, GoogleAuthRequest, UserPublic

router = APIRouter(tags=["auth"])


@router.post("/auth/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    idinfo = verify_google_token(body.id_token)
    google_id = idinfo["sub"]
    email = idinfo.get("email", "")
    name = idinfo.get("name") or email.split("@")[0]

    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(google_id=google_id, email=email, name=name)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(str(user.id))
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))
