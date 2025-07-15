from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean    #  Enum as PgEnum
from sqlalchemy.orm import Mapped, mapped_column
#  import enum


db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)
    first_name = db.Column(db.String(), unique=False, nullable=True)
    last_name = db.Column(db.String(), unique=False, nullable=True)
    role = db.Column(db.Enum("admin", "user", name="user_role"), unique=False, nullable=False)

    def __repr__(self):
        return f"<User {self.id} - {self.email}>"

    def serialize(self):
        return {"id": self.id,
                "email": self.email, 
                "is_active": self.is_active,
                "role": self.role,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "role": self.role}
    
    
""" class UserRole(enum.Enum):
    admin = "admin"
    user = "user" """

