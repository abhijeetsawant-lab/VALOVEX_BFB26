from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from database.feedback import save_feedback, get_feedback_stats

router = APIRouter()


class FeedbackRequest(BaseModel):
    query_text: str = ""
    rating: int          # 1 = thumbs-up, -1 = thumbs-down
    language: str = "en-IN"
    scheme_id: Optional[str] = None


@router.post("/feedback")
async def post_feedback(body: FeedbackRequest):
    """Save user thumbs-up / thumbs-down on a response."""
    if body.rating not in (1, -1):
        raise HTTPException(status_code=400, detail="Rating must be 1 or -1.")
    await save_feedback(body.query_text, body.rating, body.language, body.scheme_id)
    return {"status": "saved", "rating": body.rating}


@router.get("/admin/feedback")
async def admin_feedback():
    """Return aggregated feedback statistics."""
    stats = await get_feedback_stats()
    return JSONResponse(content=stats)
