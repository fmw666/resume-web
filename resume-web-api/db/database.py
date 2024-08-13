from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.config import DATABASE_URL


engine = create_engine(DATABASE_URL._url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db() -> Generator:
    """
    每一个请求处理完毕后会关闭当前连接，不同的请求使用不同的连接
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
