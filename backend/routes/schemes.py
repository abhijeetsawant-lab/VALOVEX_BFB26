from fastapi import APIRouter
from fastapi.responses import JSONResponse
from services.scheme_matcher import get_all_schemes, get_scheme

router = APIRouter()


@router.get("/schemes")
async def list_schemes():
    """Return summary list of all schemes for the browser page."""
    return JSONResponse(content={"schemes": get_all_schemes()})


@router.get("/schemes/{scheme_id}")
async def get_scheme_detail(scheme_id: str):
    """Return full detail for a single scheme."""
    scheme = get_scheme(scheme_id)
    if not scheme:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found.")
    return JSONResponse(content=scheme)
