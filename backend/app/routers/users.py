from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.recommender import score_match, match_percent
from app.schemas import RecommendedUser, UserPublic, UserUpdate

router = APIRouter(tags=["users"])


@router.get("/users/me", response_model=UserPublic)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic.model_validate(current_user)


@router.put("/users/me", response_model=UserPublic)
async def update_me(
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    if not current_user.profile_complete:
        required = [current_user.year, current_user.branch, current_user.contact_info]
        if all(r is not None for r in required):
            current_user.profile_complete = True

    await db.commit()
    await db.refresh(current_user)
    return UserPublic.model_validate(current_user)


@router.get("/users/recommended", response_model=List[RecommendedUser])
async def recommended_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(
            User.is_looking == True,
            User.profile_complete == True,
            User.id != current_user.id,
        )
    )
    candidates = result.scalars().all()

    scored = []
    for candidate in candidates:
        s = score_match(current_user, candidate)
        user_data = UserPublic.model_validate(candidate).model_dump()
        scored.append(RecommendedUser(**user_data, score=s, match_percent=match_percent(s)))

    scored.sort(key=lambda u: u.score, reverse=True)
    return scored[:20]


@router.get("/users", response_model=List[UserPublic])
async def browse_users(
    year: Optional[List[int]] = Query(default=None),
    branch: Optional[List[str]] = Query(default=None),
    veg_nonveg: Optional[str] = None,
    hometown: Optional[str] = None,
    interests: Optional[List[str]] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(
        User.is_looking == True,
        User.profile_complete == True,
        User.id != current_user.id,
    )
    if year:
        query = query.where(User.year.in_(year))
    if branch:
        query = query.where(User.branch.in_(branch))
    if veg_nonveg:
        query = query.where(User.veg_nonveg == veg_nonveg)
    if hometown:
        query = query.where(User.hometown.ilike(f"%{hometown}%"))
    if interests:
        query = query.where(User.interests.overlap(interests))

    result = await db.execute(query)
    return [UserPublic.model_validate(u) for u in result.scalars().all()]


@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user(
    user_id: UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic.model_validate(user)
