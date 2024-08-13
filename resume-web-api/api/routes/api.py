from fastapi import APIRouter

from . import authentication, resume


router = APIRouter()
router.include_router(authentication.router, tags=["用户认证"], prefix="/auth")
router.include_router(resume.router, tags=["个人信息"], prefix="/resume")
