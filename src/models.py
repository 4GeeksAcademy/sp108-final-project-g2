from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Activities(db.Model):
    __tablename__ = 'activities' #nombre de la tabla
    id = db.Column(db.Integer, primary_key=True) #Identificador unico
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id')) #contector de una tabla a otra
    trip_to = db.relationship('Trips', foreign_keys=[trip_id], backref=db.backref('activities_to', lazy='select'))
    title = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    start_date = db.Column(db.DateTime) # Fecha de inicio y fin de la actividad
    end_date = db.Column(db.DateTime)
    latitude = db.Column(db.Float)   # Coordenadas geográficas (ubicación)
    longitude = db.Column(db.Float)
    note = db.Column(db.Text)  # Nota libre sobre la actividad
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Fecha automática cuando se crea el registro
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) #Esto se actualiza automáticamente cada vez que cambias el registro


     # Método para convertir la actividad en JSON
    def serialize(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "type": self.type,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "note": self.note,
            "created_at": self.created_at,
            "updated_at": self.updated_at

        }
    
class ActivitiesMedia(db.Model):
    __tablename__='activities_media'
    id = db.Column(db.Integer, primary_key=True)
    medium_url = db.Column(db.String, nullable=False) # URL del archivo
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id')) # Actividad a la que pertenece este archivo
    activity_to = db.relationship('Activities', foreign_keys=[activity_id], backref=db.backref('media_to', lazy='select'))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id')) # role_id conecta este modelo con la tabla Roles. Indica a qué rol pertenece este registro.
    role_to = db.relationship('Roles', foreign_keys=[role_id], backref=db.backref('media_to', lazy='select'))

    def serialize(self):
        return {
            "id": self.id,
            "medium_url": self.medium_url,
            "activity_id": self.activity_id,
            "role_id": self.role_id
        }