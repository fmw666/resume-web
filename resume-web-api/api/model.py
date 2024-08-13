from sqlalchemy import Column, String

from lib.security import verify_password, get_password_hash, generate_salt

from models.base import Base
from models.mixins import DateTimeModelMixin, SoftDeleteModelMixin


class User(Base, DateTimeModelMixin, SoftDeleteModelMixin):
    __tablename__ = "user"
    email = Column(String(32), unique=True, index=True)
    username = Column(String(32))
    salt = Column(String(32))
    password = Column(String(600))

    # 检查密码是否相等
    def check_password(self, password: str) -> bool:
        return verify_password(self.salt + password, self.password)

    # 修改密码
    def change_password(self, password: str) -> None:
        self.salt = generate_salt()
        self.password = get_password_hash(self.salt + password)


class Info(Base, DateTimeModelMixin):
    __tablename__ = "info"
    en_name = Column(String(32))
    zh_name = Column(String(32))
    short_job_desc = Column(String(300))
    wechat_url = Column(String(32))
    github_url = Column(String(32))
    email = Column(String(32))
    avatar_url = Column(String(300))
    introduce = Column(String(600))


class Message(Base, DateTimeModelMixin, SoftDeleteModelMixin):
    __tablename__ = "message"
    name = Column(String(32))
    email = Column(String(32))
    subject = Column(String(32))
    content = Column(String(600))
