from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.schemas.journey import SaveJourneyRequest, SubmitJourneyResponse
from app.services.matchmaking.v1 import mock_personality_scores
from app.schemas.response import SuccessResponse
from app.dependencies.auth import get_current_user  # middleware-based email extraction


router = APIRouter(prefix="/journey", tags=["Journey"])
@router.post(
    "/save",
    response_model=SuccessResponse[dict],
    summary="Save a single journey answer",
    description="""
Used to save either a personality or identity answer.

---

### Supported `question_key` values:

#### 🗺️ Location
- `current_country`: User's current country
- `current_city`: User's current city

#### 🧠 Personality Questions (`q0` to `q14`):
- `q0`: I enjoy discussing politics and current news.
- `q1`: I prefer small gatherings over large parties. *(Inverted scale)*
- `q2`: I like to plan ahead and stay organized.
- `q3`: I often go with the flow rather than planning. *(Inverted scale)*
- `q4`: I enjoy debating different ideas.
- `q5`: I like trying new restaurants and cuisines.
- `q6`: I feel energized when I'm around other people.
- `q7`: I enjoy listening more than talking. *(Inverted scale)*
- `q8`: I enjoy philosophical or deep conversations.
- `q9`: I prefer familiar foods over exotic dishes. *(Inverted scale)*
- `q10`: I enjoy meeting new and different types of people.
- `q11`: I like organizing events and gatherings.
- `q12`: I prefer quiet environments. *(Inverted scale)*
- `q13`: I am comfortable sharing personal stories.
- `q14`: I like helping others feel included in a group.

> 💡 For these questions, answers should be `"0"` or `"1"` (interpreted as boolean: disagree/agree).

#### 🧬 Identity Information:
- `gender`: User's gender
- `relationship_status`: User’s current relationship status
- `children`: Whether the user has children (`true`/`false`)
- `profession`: User's professional domain or industry
- `country`: Country of origin
- `dob`: Date of birth (format: `YYYY-MM-DD`)

---
"""
)

async def save_journey(
    payload: SaveJourneyRequest,
    user: str = Depends(get_current_user)
):
    user = await User.find_one(User.email == user.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    key = payload.question_key
    val = payload.answer

    if key == "current_country":
        user.current_country = val
    elif key == "current_city":
        user.current_city = val
    elif key.startswith("q") and key[1:].isdigit():
        index = int(key[1:])
        if 0 <= index < 15:
            # Assume frontend also sends the question string along with the answer
            question_text = payload.question  # <- add this to your SaveJourneyRequest schema

            if not user.personality_answers or len(user.personality_answers) < 15:
                user.personality_answers = [None] * 15

            user.personality_answers[index] = {
                "question": question_text,
                "answer": val
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid question index")
    elif key in {"gender", "relationship_status", "profession", "country"}:
        setattr(user, key, val)
    elif key == "children":
        user.children = bool(val)
    elif key == "dob":
        user.dob = val
    else:
        raise HTTPException(status_code=400, detail="Unknown question_key")

    await user.save()
    return SuccessResponse(message="Answer saved", data={})

@router.post(
    "/submit",
    response_model=SuccessResponse[SubmitJourneyResponse],
    summary="Submit the journey",
    description="Finalizes the journey and stores the personality scores"
)
async def submit_journey(user: str = Depends(get_current_user)):
    user = await User.find_one(User.email == user.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if None in user.personality_answers:
        raise HTTPException(status_code=400, detail="Not all personality questions are answered")

    scores = mock_personality_scores(user.personality_answers)
    user.personality_scores = scores
    await user.save()

    return SuccessResponse(
        message="Journey submitted successfully",
        data=SubmitJourneyResponse(message="Personality assessed", scores=scores)
    )
