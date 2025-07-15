from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean    #  Enum as PgEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime


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
        # do not serialize the password, its a security breach

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

class Trips(db.Model):
    __tablename__ = 'trips'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    publicated = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Trip {self.title}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'publicated': self.publicated
        }


class UserTrips(db.Model):
    __tablename__ = 'user_trips'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)

    def __repr__(self):
        return f'<UserTrip user={self.user_id} trip={self.trip_id}>'

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'trip_id': self.trip_id
        }

   


class Activities(db.Model):
    __tablename__ = 'activities' #nombre de la tabla
    id = db.Column(db.Integer, primary_key=True) #Identificador unico
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id')) #contector de una tabla a otra
    trip_to = db.relationship('trips', foreign_keys=[trip_id], backref=db.backref('activities_to', lazy='select'))
    title = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    company = db.Column(db.String)
    start_date = db.Column(db.DateTime) # Fecha de inicio y fin de la actividad
    end_date = db.Column(db.DateTime)
    latitude = db.Column(db.Float)   # Coordenadas geográficas (ubicación)
    longitude = db.Column(db.Float)
    notes = db.Column(db.Text)  # Nota libre sobre la actividad
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Fecha automática cuando se crea el registro


     # Método para convertir la actividad en JSON
    def serialize(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "type": self.type,
            "company":self.company,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "notes": self.notes,
            "created_at": self.created_at
        }
    
class ActivitiesHistory(db.Model):
    __tablename__='activities_history'
    id = db.Column(db.Integer, primary_key=True)
    medium_url = db.Column(db.String, nullable=False) # URL del archivo
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id')) # Actividad a la que pertenece este archivo
    activity_to = db.relationship('Activities', foreign_keys=[activity_id], backref=db.backref('media_to', lazy='select'))
    create_at_ = db.Column(db.DateTime, default=datetime.utcnow) # Fecha automática cuando se crea el registro , Si no se proporciona manualmente, se asigna automáticamente con la hora actual en formato UTC

    def serialize(self):
        return {
            "id": self.id,
            "medium_url": self.medium_url,
            "activity_id": self.activity_id,
            "role_id": self.role_id,
            "created_at": self.created_at
        }
    