from typing import List, Any, Union
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from app_resume.schema import UserCreate, UserInfo
from app_resume.model import User, Info


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
@router.get("/info", response_model=Union[UserInfo, Any], name="获取个人信息")
async def get_info(db: Session = Depends(get_db)):
    db_info = Info.all(db)
    if not db_info:
        raise HTTPException(status_code=404, detail="Info not found")
    return db_info

# 下载 CV 简历
@router.post("/download", name="下载 CV 简历")
async def download_cv():
    return "download"

# 新建用户
@router.post("/", response_model=UserInfo, name="新建用户")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 判断数据库内用户是否已存在
    if User.get_by(db, username=user.username):
        raise HTTPException(
            status_code=404,
            detail="用户已存在"
        )
    # 判断数据库内邮箱是否已存在
    if User.get_by(db, email=user.email):
        raise HTTPException(
            status_code=404,
            detail="邮箱已注册"
        )
    
    db_user =  User(**user.dict())
    db_user.change_password(user.password)
    db_user.save(db)
    return db_user


# 获取所有用户
@router.get("/", response_model=List[UserInfo], name="获取所有用户")
async def get_users(db: Session = Depends(get_db)):
    return User.all(db)


# 通过id更改用户
@router.put("/{user_id}", name="更改用户 by user_id")
async def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = User.get_or_404(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 判断数据库内新用户名是否已存在
    db_user_by_username = User.get_by(db, username=user.username)
    if db_user_by_username and db_user_by_username != db_user:
        raise HTTPException(
            status_code=404,
            detail="用户名已存在"
        )
    # 判断数据库内新邮箱是否已存在
    db_user_by_email = User.get_by(db, email=user.email)
    if db_user_by_email and db_user_by_email != db_user:
        raise HTTPException(
            status_code=404,
            detail="邮箱已注册"
        )
    
    db_user.username = user.username
    db_user.email = user.email
    db_user.change_password(user.password)
    db_user.save(db)
    return db_user


# 通过id删除用户
@router.delete("/{user_id}", name="删除用户 by user_id")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    User.remove_by(db, id=user_id)
    return 0
