"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users , Activities , ActivitiesHistory, Trips, UserTrips
from sqlalchemy import asc
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API

# REGISTRO DE USUARIO
@api.route("/users", methods=["POST"])
def register():
    response_body = {}
    user_to_post = request.get_json()

    # Validación básica
    email = user_to_post.get("email", "").lower()
    password = user_to_post.get("password")

    if not email or not password:
        response_body["results"] = None
        response_body["message"] = "Email and password are required"
        return jsonify(response_body), 400

    # Verificar si ya existe el email
    existing_user = db.session.execute(
        db.select(Users).where(Users.email == email)
    ).scalar()
    if existing_user:
        response_body["results"] = None
        response_body["message"] = f"Email address {email} is already in use"
        return jsonify(response_body), 409

    # Crear nuevo usuario
    user = Users(
        email=email,
        password=password,
        is_active=True,
        first_name=user_to_post.get("first_name"),
        last_name=user_to_post.get("last_name"),
    )
    db.session.add(user)
    db.session.commit()

    # Crear claims para JWT
    claims = {
        "email": user.email,
        "is_active": user.is_active,
        "first_name": user.first_name,
        "last_name": user.last_name
    }
    access_token = create_access_token(identity=user.email, additional_claims=claims)

    response_body["results"] = user.serialize()
    response_body["access_token"] = access_token
    response_body["message"] = f"User {user.id} created successfully"
    return jsonify(response_body), 201


# LOGIN DE USUARIO
@api.route("/login", methods=["POST"])
def login():
    response_body = {}
    user_to_login = request.json

    email = user_to_login.get("email", "").lower()
    password = user_to_login.get("password", "")

    if not email or not password:
        response_body["results"] = None
        response_body["message"] = "Email and password are required"
        return jsonify(response_body), 400

    user = db.session.execute(
        db.select(Users).where(
            Users.email == email,
            Users.password == password,
            Users.is_active == True
        )
    ).scalar()

    if not user:
        response_body["results"] = None
        response_body["message"] = "Invalid credentials"
        return jsonify(response_body), 401

    claims = {
        "user_id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    access_token = create_access_token(identity=user.email, additional_claims=claims)

    response_body["results"] = user.serialize()
    response_body["access_token"] = access_token
    response_body["message"] = f"User {user.id} logged in successfully"
    return jsonify(response_body), 200


# OBTENER TODOS LOS USUARIOS ACTIVOS
@api.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    response_body = {}

    users = db.session.execute(
        db.select(Users).where(Users.is_active == True).order_by(asc(Users.id))
    ).scalars()

    results = [user.serialize_relationships() for user in users]

    if not results:
        response_body["results"] = None
        response_body["message"] = "No active users found"
        return jsonify(response_body), 404

    response_body["results"] = results
    response_body["message"] = "Users retrieved successfully"
    return jsonify(response_body), 200


# OBTENER, ACTUALIZAR O ELIMINAR USUARIO POR ID
@api.route("/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_user(user_id):
    response_body = {}

    user = db.session.execute(
        db.select(Users).where(Users.id == user_id)
    ).scalar()

    if not user or not user.is_active:
        response_body["results"] = None
        response_body["message"] = f"User {user_id} not found"
        return jsonify(response_body), 404

    claims = get_jwt()
    current_user_id = claims.get("user_id")

    if request.method == "GET":
        response_body["results"] = user.serialize_relationships()
        response_body["message"] = f"User {user.id} retrieved successfully"
        return jsonify(response_body), 200

    if request.method == "PUT":
        if current_user_id != user_id:
            response_body["results"] = None
            response_body["message"] = f"User {current_user_id} is not authorized to update user {user_id}"
            return jsonify(response_body), 403

        data_input = request.json

        # Validar si se intenta cambiar a un email que ya existe en otro usuario
        new_email = data_input.get("email", user.email).lower()
        if new_email != user.email:
            existing_user = db.session.execute(
                db.select(Users).where(Users.email == new_email)
            ).scalar()
            if existing_user:
                response_body["results"] = None
                response_body["message"] = "Email address is already in use"
                return jsonify(response_body), 409
            user.email = new_email

        # Actualizar otros campos
        user.password = data_input.get("password", user.password)
        user.first_name = data_input.get("first_name", user.first_name)
        user.last_name = data_input.get("last_name", user.last_name)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            response_body["results"] = None
            response_body["message"] = "Error updating user. Possible duplicate data."
            return jsonify(response_body), 409

        response_body["results"] = user.serialize()
        response_body["message"] = f"User {user.id} updated successfully"
        return jsonify(response_body), 200

    if request.method == "DELETE":
        if current_user_id != user_id:
            response_body["results"] = None
            response_body["message"] = f"User {current_user_id} is not authorized to delete user {user_id}"
            return jsonify(response_body), 403

        user.is_active = False
        db.session.commit()

        response_body["results"] = None
        response_body["message"] = f"User {user.id} deleted successfully"
        return jsonify(response_body), 200
    

@api.route("/user-trips", methods=["GET", "POST"])
@jwt_required()
def handle_users_trips():
    response_body = {}
    users_trips = db.session.execute(db.select(UserTrips)).scalars()
    if request.method == "GET":
        results = [row.serialize() for row in users_trips]
        response_body["results"] = results
        response_body["message"] = "User trips got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code
    if request.method == "POST":
        data = request.json
        user_id = data.get("user_id", None)
        trip_id = data.get("trip_id", None)
        trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
        trip_owner_id = trip.trip_owner_id
        claims = get_jwt()
        token_user_id = claims["user_id"]
        user_is_owner = trip_owner_id == token_user_id
        if user_is_owner:
            user_trip = UserTrips()
            user_trip.user_id = user_id
            user_trip.trip_id = trip_id
            db.session.add(user_trip)
            db.session.commit()
            response_body["results"] = user_trip.serialize()
            response_body["message"] = f"User {user_trip.user_id} has been added to trip {user_trip.trip_id}"
            return jsonify(response_body), 200


@api.route("/user-trips/<int:user_trips_id>", methods=["GET", "DELETE"])
def handle_user_trip(user_trips_id):
    response_body = {}
    user_trip = db.session.execute(db.select(UserTrips).where(
        UserTrips.id == user_trips_id)).scalar()
    if not user_trip:
        response_body["result"] = None
        response_body["message"] = f"User-Trip relationship {user_trips_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        result = user_trip.serialize()
        response_body["result"] = result
        response_body["message"] = f"User-Trip relationship {user_trips_id} got successfully"
        status_code = 200 if result else 404
        return jsonify(response_body), status_code
    if request.method == "DELETE":
        db.session.delete(user_trip)
        db.session.commit()
        response_body["result"] = None
        response_body["message"] = f"User-Trip relationship {user_trips_id} deleted successfully"
        return jsonify(response_body), 200
    

@api.route("/trips", methods=["GET", "POST"])
@jwt_required()
def handle_trips():
    response_body = {}
    trips = db.session.execute(db.select(Trips).order_by(asc(Trips.start_date))).scalars()
    if request.method == "GET":
        results = [row.serialize_relationships() for row in trips]
        response_body["results"] = results
        response_body["message"] = "Trips got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code
    if request.method == "POST":
        claims = get_jwt()
        token_user_id = claims["user_id"]
        data = request.json
        trip_owner_id = token_user_id
        title = data.get("title", None)
        start_date = data.get("start_date", None)
        end_date = data.get("end_date", None)
        publicated = data.get("publicated", None)
        trip = Trips()
        trip.trip_owner_id = trip_owner_id
        trip.title = title
        trip.start_date = start_date
        trip.end_date = end_date
        trip.publicated = publicated
        db.session.add(trip)
        db.session.commit()
        response_body["results"] = trip.serialize()
        response_body["message"] = f"User {trip.trip_owner_id} now owns the trip {trip.title}"
        return jsonify(response_body), 200


@api.route("/trips/<int:trip_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_trip(trip_id):
    response_body = {}
    trip = db.session.execute(db.select(Trips).where(
        Trips.id == trip_id)).scalar()
    if not trip:
        response_body["result"] = None
        response_body["message"] = f"Trip {trip_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        if not user_is_owner:
            trip_user = db.session.execute(db.select(UserTrips).where(UserTrips.trip_id == trip_id, 
                                                                      UserTrips.user_id == token_user_id)).scalar()
            if not trip_user:
                response_body["result"] = None
                response_body["message"] = f"User {token_user_id} is not allowed to get trip {trip_id}"
                return jsonify(response_body), 403
        result = trip.serialize_relationships()
        response_body["result"] = result
        response_body["message"] = f"Trip {trip.title} got successfully"
        return jsonify(response_body), 200
    if request.method == "PUT":
        data_input = request.json
        trip.title = data_input.get("title", trip.title)
        trip.start_date = data_input.get("start_date", trip.start_date)
        trip.end_date = data_input.get("end_date", trip.end_date)
        trip.publicated = data_input.get("publicated", trip.publicated)
        db.session.commit()
        response_body["result"] = trip.serialize()
        response_body["message"] = f"Trip {trip.title} put successfully"
        return jsonify(response_body), 200
    if request.method == "DELETE":
        if trip_owner_id != token_user_id:
            response_body["result"] = None
            response_body["message"] = f"User {token_user_id} is not allowed to delete trip {trip_id}"
            return jsonify(response_body), 404
        if trip_owner_id == token_user_id:
            db.session.delete(trip)
            db.session.commit()
            response_body["result"] = None
            response_body["message"] = f"Trip deleted successfully"
            return jsonify(response_body), 200
    

#Endpoints activities

#trae la actividad por id
@api.route('/activities/<int:id>', methods=['GET'])
def get_activity_by_id(id):
    response_body = {}

    activity = Activities.query.get_or_404(id)  # Busca la actividad por ID o devuelve error 404

    response_body['result'] = activity.serialize()  # Convierte el objeto en JSON
    response_body['message'] = f'Actividad con ID {id} obtenida correctamente'

    return response_body, 200


# traer lista de todas la actividades o crear una nueva 
@api.route('/activities', methods =[ 'GET' , 'POST' ])
def handle_activity():
    response_body ={}
    if request.method == 'GET':
        rows =db.session.execute(db.Select(Activities)).scalars() #Consultamos todas las actividades
        response_body['results'] = [row.serialize() for row in rows]
        response_body['message'] = 'listado de actividades'
        return response_body, 200
    if request.method == 'POST':
        data = request.get_json() #Creamos la actividad
        new = Activities(
            trip_id =data.get('trip_id'),
            title=data.get('title'),
            type=data.get('type'),
            company=data.get('company'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            notes=data.get('notes')
        )
        db.session.add(new) # Agregamos el nuevo objeto a la sesión de la base de datos
        db.session.commit() # Guardamos oficialmente los cambios en la base de datos (inserta el nuevo registro

        response_body['message'] = 'Actividad creada exitosamente'
        response_body['results'] = new.serialize()
        return response_body, 201


@api.route('/activities/<int:id>' , methods =['PUT'])
def update_activity(id):
    response_boy= {}

    activity = Activities.query.get_or_404(id) #Busca id o regresa un error 404
    data = request.get_json()

    #Actiliza los campos enviados en el JSON

    activity.trip_id = data.get('trip_id' , activity.trip_id)
    activity.title = data.get('title' , activity.title)
    activity.type = data.get ('type' , activity.type)
    activity.company = data.get ('company' , activity.company)
    activity.start_date = data.get('start_date' , activity.start_date)
    activity.end_date = data.get('end_date', activity.end_date)
    activity.latitude = data.get('latitude', activity.latitude)
    activity.longitude = data.get('longitude', activity.longitude)
    activity.notes = data.get('notes', activity.notes)

    db.session.commit()  # Guarda los cambios en la base de datos

    response_boy['message'] = 'Actividad actulizada correctamente'
    response_boy['result'] = activity.serialize()
    return response_boy,200


@api.route('/activities/<int:id>' , methods =['DELETE'])

def delete_activity(id):
    response_body = {}

    activity =Activities.query.get_or_404(id)
    db.session.delete(activity) # maraca el obejto para eliminarlo
    db.session.commit() # ejecuta el cambio en la base de datos


    response_body['message'] = f'Actividad con ID{id} eliminada correctamente'
    return response_body,200

#Endpoints activitites media

@api.route('/history-media' ,  methods = ['GET'])
def handle_history_media():
    response_body={}
    rows = db.session.execute(db.select(ActivitiesHistory)).scalars()
    response_body['results'] = [row.serialize() for row in rows]
    response_body['message'] = 'Listado de las historias '
    return response_body,200


#trae la historia por su id 
@api.route('/history-media/<int:id>', methods=['GET'])
def get_history_media_by_id(id):
    response_body = {}

    media = ActivitiesHistory.query.get_or_404(id)  # Busca el recuerdo por ID o lanza 404
    response_body['result'] = media.serialize()
    response_body['message'] = f'Recuerdo con ID {id} encontrado correctamente'

    return response_body, 200

    


@api.route('/history-media' , methods = ['POST'])
def create_history_media():
    response_body ={}

    data = request.get_json()

    new = ActivitiesHistory(
        media_url=data.get('media_url'), #el enlace del archivo
        activity_id=data.get('activity_id') #el ID de la actividad a la que pertenece
        #  # No hace falta poner created_at ,se genera solo.
    )
    db.session.add(new)
    db.session.commit()
    response_body['message'] = 'Archivo de la historia creado correctamente'
    response_body['result'] = new.serialize()

    return response_body, 201


@api.route('/history-media/<int:id>', methods=['PUT'])
def update_history_media(id):
    response_body = {}

    media = ActivitiesHistory.query.get_or_404(id)
    data = request.get_json()

    media.media_url = data.get('media_url', media.media_url)
    media.activity_id = data.get('activity_id', media.activity_id)

    db.session.commit()

    response_body['message'] = f'Archivo con ID {id} actualizado correctamente'
    response_body['result'] = media.serialize()

    return response_body, 200


@api.route('/history-media/<int:id>', methods=['DELETE'])
def delete_history_media(id):
    response_body = {}

    media = ActivitiesHistory.query.get_or_404(id)
    db.session.delete(media)
    db.session.commit()

    response_body['message'] = f'Archivo con ID {id} eliminado correctamente'

    return response_body, 200

