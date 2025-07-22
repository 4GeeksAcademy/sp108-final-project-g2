from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)
    first_name = db.Column(db.String(), unique=False, nullable=True)
    last_name = db.Column(db.String(), unique=False, nullable=True)
    role = db.Column(db.Enum("admin", "user", name="role"),
                     unique=False, nullable=False)

    def __repr__(self):
        return f"<User {self.id} - {self.email}>"

    def serialize_relationships(self):
        return {"id": self.id,
                "email": self.email,
                "is_active": self.is_active,
                "role": self.role,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "role": self.role,
                "trips": [row.serialize() for row in self.trips]
                }

    def serialize(self):
        return {"id": self.id,
                "email": self.email,
                "is_active": self.is_active,
                "role": self.role,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "role": self.role
                }


class Trips(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.Integer, primary_key=True)
    trip_owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    trip_owner_to = db.relationship("Users", foreign_keys=[
                                    trip_owner_id], backref=db.backref("trips", lazy="select"))
    title = db.Column(db.String(100))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    publicated = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Trip {self.title}>'

    def serialize_relationships(self):
        return {
            'id': self.id,
            "trip_owner_to": self.trip_owner_to.serialize() if self.trip_owner_to else None,
            'title': self.title,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'publicated': self.publicated,
            "activities": [row.serialize() for row in self.activities]
            }

    def serialize(self):
        return {
            'id': self.id,
            "trip_owner_id": self.trip_owner_id,
            'title': self.title,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'publicated': self.publicated
            }


class UserTrips(db.Model):
    __tablename__ = 'user_trips'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_to = db.relationship("Users", foreign_keys=[
                              user_id], backref=db.backref("user_trips", lazy="select"))
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    trip_to = db.relationship("Trips", foreign_keys=[
                              trip_id], backref=db.backref("user_trips", lazy="select"))

    def __repr__(self):
        return f'<user = {self.user_id} - trip = {self.trip_id}>'

    def serialize_users(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            "trip_to": self.trip_to.serialize() if self.trip_to else None
            }

    def serialize_trips(self):
        return {
            'id': self.id,
            'user_to': self.user_to.serialize() if self.user_to else None,
            "trip_id": self.trip_id
            }
    
    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            "trip_id": self.trip_id
            }


class Activities(db.Model):
    __tablename__ = 'activities'  # nombre de la tabla
    id = db.Column(db.Integer, primary_key=True)  # Identificador unico
    trip_id = db.Column(db.Integer, db.ForeignKey(
        'trips.id'))  # contector de una tabla a otra
    trip_to = db.relationship("Trips", foreign_keys=[
                              trip_id], backref=db.backref('activities', lazy='select'))
    title = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    company = db.Column(db.String)
    # Fecha de inicio y fin de la actividad
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    latitude = db.Column(db.Float)   # Coordenadas geográficas (ubicación)
    longitude = db.Column(db.Float)
    notes = db.Column(db.Text)  # Nota libre sobre la actividad
    # Fecha automática cuando se crea el registro
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize_relationships(self):
        return {
            "id": self.id,
            "trip_to": self.trip_to.serialize() if self.trip_to else None,
            "type": self.type,
            "company": self.company,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "notes": self.notes,
            "created_at": self.created_at,
            "activity_history": [row.serialize() for row in self.activities_history_to] 
        }

    def serialize(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "title": self.title,
            "type": self.type,
            "company": self.company,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "notes": self.notes,
            "created_at": self.created_at
        }


class ActivitiesHistory(db.Model):
    __tablename__ = 'activities_history'
    id = db.Column(db.Integer, primary_key=True)
    media_url = db.Column(db.String, nullable=False)  # URL del archivo
    # Actividad a la que pertenece este archivo
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'))
    activity_to = db.relationship('Activities', foreign_keys=[
                                  activity_id], backref=db.backref('activities_history_to', lazy='select'))
    # Fecha automática cuando se crea el registro , Si no se proporciona manualmente, se asigna automáticamente con la hora actual en formato UTC
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize_relationships(self):
        return {
            "id": self.id,
            "media_url": self.media_url,
            "activity_to": self.activity_to.serialize() if self.activity_to else None,
            "created_at": self.created_at
            }
        
    def serialize(self):
        return {
            "id": self.id,
            "media_url": self.media_url,
            "activity_id": self.activity_id,
            "created_at": self.created_at
            }
