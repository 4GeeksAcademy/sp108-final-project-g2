"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users, Trips, UserTrips, Activities, Stories
from sqlalchemy import asc
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt
import cloudinary.uploader



api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API

# REGISTRO DE USUARIO
@api.route("/register", methods=["POST"])
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
        "user_id": user.id
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
            (Users.email == email),
            (Users.password == password),
            (Users.is_active == True)
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
        if claims["user_id"] != user_id:
            response_body["results"] = None
            response_body["message"] = f"User {current_user_id} is not authorized to delete user {user_id}"
            return jsonify(response_body), 403

        user.is_active = False
        db.session.commit()

        response_body["results"] = user.serialize()
        response_body["message"] = f"User {user.id} deleted successfully"
        return jsonify(response_body), 200


@api.route("/trips", methods=["GET", "POST"])
@jwt_required()
def handle_trips():
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "User not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if request.method == "GET":
        user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.user_id == token_user_id)).scalars()
        user_is_owner = db.session.execute(db.select(Trips).where(Trips.trip_owner_id == token_user_id)).scalars()
        if not user_is_owner and not user_is_associated:
            response_body["message"] = f"User {token_user_id} does not own or is associated with any trips"
            response_body["results"] = None
            return jsonify(response_body), 404
        if not user_is_owner:
            user_results = [row.serialize_trips() for row in user_is_associated]
            response_body["message"] = f"Trips from participant {token_user_id} got successfully"
            response_body["results"] = {"user_trips": user_results, 
                                        "trips_owner": None}
            return jsonify(response_body), 200
        if not user_is_associated:
            owner_results = [row.serialize() for row in user_is_owner]
            response_body["message"] = f"Trips from owner {token_user_id} got successfully"
            response_body["results"] = {"user_trips": None, 
                                        "trips_owner": owner_results}
            return jsonify(response_body), 200
        user_results = [row.serialize_trips() for row in user_is_associated]
        owner_results = [row.serialize() for row in user_is_owner]
        response_body["message"] = f"Trips from user {token_user_id} got successfully"
        response_body["results"] = {"user_trips": user_results, 
                                    "trips_owner": owner_results}
        return jsonify(response_body), 200
    if request.method == "POST":
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
        results = trip.serialize()
        response_body["message"] = f"User {trip_owner_id} now owns trip {trip.id}"
        response_body["results"] = results
        return jsonify(response_body), 200


@api.route("/trips/<int:trip_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_trip(trip_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
    if not trip:
        response_body["message"] = f"Trip {trip_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip_owner_id = trip.trip_owner_id
    user_is_owner = trip_owner_id == token_user_id
    if request.method == "GET":
        if not user_is_owner:
            user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.trip_id == trip_id, 
                                                                         UserTrips.user_id == token_user_id)).scalar()
            if not user_is_associated:
                publicated = db.session.execute(db.select(Trips).where(Trips.publicated == True,
                                                                       Trips.id == trip_id)).scalar()
                if not publicated:
                    response_body["message"] = f"User {token_user_id} is not allowed to get trip {trip_id}"
                    response_body["results"] = None
                    return jsonify(response_body), 403
        results = trip.serialize_relationships()
        response_body["message"] = f"Trip {trip.title} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "PUT":
        if not user_is_owner:
            response_body["message"] = f"User {token_user_id} is not allowed to put trip {trip_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        data_input = request.json
        trip.title = data_input.get("title", trip.title)
        trip.start_date = data_input.get("start_date", trip.start_date)
        trip.end_date = data_input.get("end_date", trip.end_date)
        trip.publicated = data_input.get("publicated", trip.publicated)
        db.session.commit()
        response_body["result"] = trip.serialize()
        response_body["message"] = f"Trip {trip_id} put successfully"
        return jsonify(response_body), 200
    if request.method == "DELETE":
        if not user_is_owner:
            response_body["message"] = f"User {token_user_id} is not allowed to delete trip {trip_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        db.session.delete(trip)
        db.session.commit()
        response_body["message"] = f"Trip {trip_id} deleted successfully"
        response_body["result"] = None
        return jsonify(response_body), 200
    

@api.route("/trips/<int:trip_id>/users", methods=["GET", "POST"])
@jwt_required()
def handle_trip_users(trip_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
    if not trip:
        response_body["results"] = None
        response_body["message"] = f"Trip {trip_id} not found"
        return jsonify(response_body), 404
    trip_owner_id = trip.trip_owner_id
    user_is_owner = trip_owner_id == token_user_id
    if request.method == 'GET':
        if not user_is_owner:
            user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.user_id == token_user_id,
                                                                               UserTrips.trip_id == trip_id)).scalar()
            if not user_is_associated:
                publicated = db.session.execute(db.select(Trips).where(Trips.publicated == True,
                                                                       Trips.id == trip_id)).scalar()
                if not publicated:
                    response_body["message"] = f"User {token_user_id} is not allowed to get users from trip {trip_id}"
                    response_body["results"] = None
                    return jsonify(response_body), 403
        trip_owner_user = db.session.execute(db.select(Users).where(Users.id == trip_owner_id)).scalar()
        trip_owner_results = trip_owner_user.serialize()
        users_in_trip =  db.session.execute(db.select(UserTrips).where(UserTrips.trip_id == trip_id)).scalars()
        if not users_in_trip:
            response_body["message"] = f"Trip {trip_id} has no users associated yet"
            response_body["results"] = {"trip_owner": trip_owner_results,
                                        "trip_users": None}
            return jsonify(response_body), 200
        users_results = [row.serialize_users() for row in users_in_trip]
        response_body["message"] = f"Users from trip {trip_id} got successfully"
        response_body["results"] = {"trip_owner": trip_owner_results,
                                    "trip_users": users_results}
        return jsonify(response_body), 200
    if request.method == "POST":
        # En el front otro endpoint para buscar por email
        if not user_is_owner:
            response_body["message"] = f"User {token_user_id} is not allowed to post user {user_id} to trip {trip_id}"
            response_body["results"] = None
            return jsonify(response_body), 403
        data = request.json
        user_id = data.get("user_id", None)
        user = db.session.execute(db.select(Users).where(Users.id == user_id)).scalar()
        if not user:
            response_body["message"] = f"User {user_id} not found"
            response_body["results"] = None
            return jsonify(response_body), 404
        user_already_exists =  db.session.execute(db.select(UserTrips).where(UserTrips.trip_id == trip_id,
                                                                             UserTrips.user_id == user_id)).scalar()
        if user_already_exists:
            response_body["message"] = f"User {user_id} is already associated with trip {trip_id}"
            response_body["results"] = None
            return jsonify(response_body), 404                                                                
        user_trip = UserTrips()
        user_trip.user_id = user_id
        user_trip.trip_id = trip_id
        db.session.add(user_trip)
        db.session.commit()
        results = user_trip.serialize()
        response_body["message"] = f"User {user_id} has been posted to trip {trip_id}"
        response_body["results"] = results
        return jsonify(response_body), 200


@api.route("/trips/<int:trip_id>/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def handle_user_in_trip(trip_id, user_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
    if not trip:
        response_body["results"] = None
        response_body["message"] = f"Trip {trip_id} not found"
        return jsonify(response_body), 404
    user_trip = db.session.execute(db.select(UserTrips).where(UserTrips.user_id == user_id,
                                                              UserTrips.trip_id == trip_id)).scalar()
    if not user_trip:
        response_body["results"] = None
        response_body["message"] = f"User {user_id} not found in trip {trip_id}"
        return jsonify(response_body), 404
    if request.method == "DELETE":
        trip_owner_id = trip.trip_owner_id
        user_is_owner = trip_owner_id == token_user_id
        if not user_is_owner:
            user_is_associated = user_id == token_user_id
            if not user_is_associated:
                response_body["message"] = f"User {token_user_id} is not allowed to delete user {user_id} from {trip_id}"
                response_body["result"] = None
                return jsonify(response_body), 403
        db.session.delete(user_trip)
        db.session.commit()
        response_body["message"] = f"User {user_id} deleted successfully from {trip_id}"
        response_body["result"] = None
        return jsonify(response_body), 200
    

@api.route("/trips/<int:trip_id>/activities", methods=["GET", "POST"])
@jwt_required()
def handle_acivities(trip_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
    if not trip:
        response_body["message"] = f"Trip {trip_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip_owner_id = trip.trip_owner_id
    user_is_owner = trip_owner_id == token_user_id
    if request.method == 'GET':
        if not user_is_owner:
            user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.user_id == token_user_id,
                                                                               UserTrips.trip_id == trip_id)).scalar()
            if not user_is_associated:
                publicated = db.session.execute(db.select(Trips).where(Trips.publicated == True,
                                                                       Trips.id == trip_id)).scalar()
                if not publicated:
                    response_body["message"] = f"User {token_user_id} is not allowed to get activities from trip {trip_id}"
                    response_body["results"] = None
                    return jsonify(response_body), 403
        activities = db.session.execute(db.select(Activities).where(Activities.trip_id == trip_id)).scalars()
        if not activities:
            response_body["message"] = f"Trip {trip_id} has no activities yet"
            response_body["results"] = None
            return jsonify(response_body), 404
        results = [row.serialize() for row in activities]
        response_body["message"] = f"Activities from trip {trip_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "POST":
        if not user_is_owner:
            response_body["message"] = f"User {token_user_id} is not allowed to post activities in {trip_id}"
            response_body["results"] = None
            return jsonify(response_body), 403
        data = request.get_json() 
        title = data.get('title', None)
        # Cambiar por activity type
        type = data.get('type', None)
        company = data.get('company', None)
        start_date = data.get('start_date', None)
        end_date = data.get('end_date', None)
        latitude = data.get('latitude', None)
        longitude = data.get('longitude', None)
        notes = data.get('notes', None)
        activity = Activities()
        activity.trip_id = trip_id
        activity.title = title
        activity.type = type
        activity.company = company
        activity.start_date = start_date
        activity.end_date = end_date
        activity.latitude = latitude
        activity.longitude = longitude
        activity.notes = notes
        db.session.add(activity)
        db.session.commit()
        results = activity.serialize()
        response_body["message"] = f"Activity {activity.id} has been posted to trip {trip_id}"
        response_body["results"] = results
        return jsonify(response_body), 200


@api.route("/trips/<int:trip_id>/activities/<int:activity_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_activity(trip_id, activity_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
    if not trip:
        response_body["message"] = f"Trip {trip_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    activity = db.session.execute(db.select(Activities).where(Activities.trip_id == trip_id,
                                                              Activities.id == activity_id)).scalar()
    if not activity:
        response_body["message"] = f"Activity {activity_id} not found in trip {trip_id}"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip_owner_id = trip.trip_owner_id
    user_is_owner = trip_owner_id == token_user_id
    if request.method == "GET":
        if not user_is_owner:
            user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.trip_id == trip_id, 
                                                                               UserTrips.user_id == token_user_id)).scalar()
            if not user_is_associated:
                publicated = db.session.execute(db.select(Trips).where(Trips.publicated == True,
                                                                       Trips.id == trip_id)).scalar()
                if not publicated:
                    response_body["message"] = f"User {token_user_id} is not allowed to get activity {activity_id} from trip {trip_id}"
                    response_body["results"] = None
                    return jsonify(response_body), 403
        results = activity.serialize_relationships()
        response_body["message"] = f"Activity {activity_id} got successfully from trip {trip_id}"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "PUT":
        if not user_is_owner:
            response_body["message"] = f"User {token_user_id} is not allowed to put acitivity {activity_id} from trip {trip_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        data = request.json
        activity.title = data.get('title', activity.title)
        activity.type = data.get('type', activity.type)
        activity.company = data.get('company', activity.company)
        activity.start_date = data.get('start_date', activity.start_date)
        activity.end_date = data.get('end_date', activity.end_date)
        activity.latitude = data.get('latitude', activity.latitude)
        activity.longitude = data.get('longitude', activity.longitude)
        activity.notes = data.get('notes', activity.notes)
        db.session.commit()
        response_body["result"] = activity.serialize_relationships()
        response_body["message"] = f"Activity {activity_id} put successfully in trip {trip_id}"
        return jsonify(response_body), 200
    if request.method == "DELETE":
        if not user_is_owner:
            response_body["message"] = f"User {token_user_id} is not allowed to delete activity {activity_id} from trip {trip_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        db.session.delete(activity)
        db.session.commit()
        response_body["message"] = f"Activity {activity_id} deleted successfully from trip {trip_id}"
        response_body["result"] = None
        return jsonify(response_body), 200


@api.route("/trips/<int:trip_id>/activities/<int:activity_id>/stories", methods=["GET", "POST"])
@jwt_required()
def handle_stories(trip_id, activity_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]

    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
    if not trip:
        response_body["message"] = f"Trip {trip_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    activity = db.session.execute(db.select(Activities).where(Activities.id == activity_id,
                                                              Activities.trip_id == trip_id)).scalar()
    if not activity:
        response_body["message"] = f"Activity {activity_id} not found in trip {trip_id}"
        response_body["results"] = None
        return jsonify(response_body), 404
    
    trip_owner_id = trip.trip_owner_id
    user_is_owner = trip_owner_id == token_user_id
    if request.method == 'GET':
        if not user_is_owner:
            user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.user_id == token_user_id,
                                                                               UserTrips.trip_id == trip_id)).scalar()
            if not user_is_associated:
                publicated = db.session.execute(db.select(Trips).where(Trips.publicated == True,
                                                                       Trips.id == trip_id)).scalar()
                if not publicated:
                    response_body["message"] = f"User {token_user_id} is not allowed to get stories from trip {trip_id}"
                    response_body["results"] = None
                    return jsonify(response_body), 403
        stories = db.session.execute(db.select(Stories).join(Activities).where(Stories.activity_id == activity_id,
                                                                               Activities.trip_id == trip_id)).scalars()
        if not stories:
            response_body["message"] = f"Activity {activity_id} from trip {trip_id} has no stories yet"
            response_body["results"] = None
            return jsonify(response_body), 404
        results = [row.serialize() for row in stories]
        response_body["message"] = f"Stories from activity {activity_id} in trip {trip_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "POST":
        if not user_is_owner:
            user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.user_id == token_user_id,
                                                                               UserTrips.trip_id == trip_id)).scalar()
            if not user_is_associated:
                    response_body["message"] = f"User {token_user_id} is not allowed to post stories in trip {trip_id}"
                    response_body["results"] = None
                    return jsonify(response_body), 403
      #Subir imagen a cloudinary
        print ("LLEGAMOS")
        image = request.files.get('media')
        if not image:
           response_body["message"] = "No image file provided"
           response_body["results"] = None
           return jsonify(response_body), 400
        result = cloudinary.uploader.upload(
            image,
            folder=f"trips/{trip_id}/activities/{activity_id}/stories",
            overwrite=True
        )
        print (result)
        media_url = result["secure_url"]
        media_public_id = result["public_id"]

         # Crear historia
        story = Stories(
            user_id=token_user_id,
            media_url=media_url,
            media_public_id=media_public_id,
            activity_id=activity_id
        )
        db.session.add(story)
        db.session.commit()
        db.session.commit()
        results = story.serialize()
        response_body["message"] = f"Story {story.id} has been posted to activity {activity_id} in trip {trip_id}"
        response_body["results"] = results
        return jsonify(response_body), 200


@api.route("/trips/<int:trip_id>/activities/<int:activity_id>/stories/<int:story_id>", methods=["GET", "DELETE"])
@jwt_required()
def handle_activity_story(trip_id, activity_id, story_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip = db.session.execute(db.select(Trips).where(Trips.id == trip_id)).scalar()
    if not trip:
        response_body["message"] = f"Trip {trip_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    activity = db.session.execute(db.select(Activities).where(Activities.trip_id == trip_id,
                                                              Activities.id == activity_id)).scalar()
    if not activity:
        response_body["message"] = f"Activity {activity_id} not found in trip {trip_id}"
        response_body["results"] = None
        return jsonify(response_body), 404
    story = db.session.execute(db.select(Stories).join(Activities).where(Stories.id == story_id,
                                                                         Stories.activity_id == activity_id,
                                                                         Activities.trip_id == trip_id)).scalar()
    if not story:
        response_body["message"] = f"Story {story_id} not found in activity {activity_id} from trip {trip_id}"
        response_body["results"] = None
        return jsonify(response_body), 404
    trip_owner_id = trip.trip_owner_id
    user_is_owner = trip_owner_id == token_user_id
    if request.method == "GET":
        if not user_is_owner:
            user_is_associated = db.session.execute(db.select(UserTrips).where(UserTrips.trip_id == trip_id, 
                                                                               UserTrips.user_id == token_user_id)).scalar()
            if not user_is_associated:
                publicated = db.session.execute(db.select(Trips).where(Trips.publicated == True,
                                                                       Trips.id == trip_id)).scalar()
                if not publicated:
                    response_body["message"] = f"User {token_user_id} is not allowed to get story {story_id} in activity {activity_id} from trip {trip_id}"
                    response_body["results"] = None
                    return jsonify(response_body), 403
        results = story.serialize()
        response_body["message"] = f"Story {story_id} got successfully from activity {activity_id} in trip {trip_id}"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "DELETE":
        if not user_is_owner:
            story_user = db.session.execute(db.select(Stories).join(Activities).where(Stories.user_id == token_user_id,
                                                                                      Stories.id == story_id,
                                                                                      Stories.activity_id == activity_id,
                                                                                      Activities.trip_id == trip_id)).scalar()
            if not story_user:
                response_body["message"] = f"User {token_user_id} is not allowed to delete story {story_id} from activity {activity_id} in {trip_id}"
                response_body["result"] = None
                return jsonify(response_body), 403
            
    #  Eliminar imagen de Cloudinary
    if story.media_public_id:
        cloudinary.uploader.destroy(story.media_public_id)

     # Eliminar historia
    db.session.delete(story)
    db.session.commit()
        
    response_body["message"] = f"Story {story_id} deleted successfully from activity {activity_id} in trip {trip_id}"
    response_body["result"] = None
    return jsonify(response_body), 200
