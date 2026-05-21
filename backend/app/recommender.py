from app.models import User

MAX_SCORE = 14  # 3+3+2+5+1


def score_match(current: User, candidate: User) -> int:
    score = 0
    if current.year and candidate.year and candidate.year == current.year:
        score += 3
    if current.branch and candidate.branch and candidate.branch == current.branch:
        score += 3
    if current.veg_nonveg and candidate.veg_nonveg and candidate.veg_nonveg == current.veg_nonveg:
        score += 2
    if current.interests and candidate.interests:
        shared = set(current.interests) & set(candidate.interests)
        score += min(len(shared), 5)
    if (
        current.hometown
        and candidate.hometown
        and current.hometown.strip().lower() == candidate.hometown.strip().lower()
    ):
        score += 1
    return score


def match_percent(score: int) -> int:
    return round((score / MAX_SCORE) * 100)
