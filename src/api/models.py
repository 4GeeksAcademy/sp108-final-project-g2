from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column


db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        # do not serialize the password, its a security breach
        return {'id': self.id,
                'email': self.email, 
                'is_active': self.is_active} 


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

   