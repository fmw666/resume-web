import os

from typing import List, Any, Union
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from db.database import get_db
from api.model import Info, Message
from api.schema import MessageCreate


router = APIRouter()


"""
接口：User 用户表增删改查

POST   /api/users            ->  create_user  ->  创建用户
GET    /api/users            ->  get_users    ->  获取所有用户
GET    /api/users/{user_id}  ->  get_user     ->  获取单个用户
PUT    /api/users/{user_id}  ->  update_user  ->  更新单个用户
DELETE /api/users/{user_id}  ->  delete_user  ->  删除单个用户
"""

# 获取 info 信息
@router.get("/info", name="获取个人信息")
async def get_info(db: Session = Depends(get_db)):
    import time
    time.sleep(3)
    db_info = Info.all(db)
    if not db_info:
        raise HTTPException(status_code=404, detail="Info not found")
    # raise HTTPException(status_code=404, detail="Info not found")
    return db_info[0]

# 下载 CV 简历
@router.post("/download", name="下载 CV 简历")
async def download_cv():
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "resume.pdf")
    print(file_path)
    try:
        return FileResponse(file_path, headers={
            "Content-Disposition": "attachment; filename=resume.pdf"
        })
    except:
        raise HTTPException(status_code=500, detail="Download failed")

# 发送 Message
@router.post("/messages", name="发送 Message")
async def send_message(message: MessageCreate, db: Session = Depends(get_db)):
    db_message =  Message(
        name=message.InputMessage,
        email=message.InputEmail,
        subject=message.InputSubject,
        content=message.InputMessage,
    )
    db_message.save(db)
    return db_message
