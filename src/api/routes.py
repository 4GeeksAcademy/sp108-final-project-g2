"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users, Trips, UserTrips
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
    role = user_to_post.get("role", "user")

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
        role=role
    )
    db.session.add(user)
    db.session.commit()

    # Crear claims para JWT
    claims = {
        "user_id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "role": user.role,
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
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name
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

    results = [user.serialize() for user in users]

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
        response_body["results"] = user.serialize()
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
        user_trip = UserTrips()
        user_trip.user_id = user_id
        user_trip.trip_id = trip_id
        db.session.add(user_trip)
        db.session.commit()
        response_body["results"] = user_trip.serialize()
        response_body["message"] = f"User {user_trip.user_id} has been added to trip {user_trip.trip_id}"
        return jsonify(response_body), 200


@api.route("/user-trips/users/<int:user_id>", methods=["GET", "DELETE"])
def handle_user_trips(user_id):
    response_body = {}
    user_trips = db.session.execute(db.select(UserTrips).where(
        UserTrips.user_id == user_id)).scalars()
    print(user_trips)
    if not user_trips:
        response_body["result"] = None
        response_body["message"] = f"User {user_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        results = [row.serialize() for row in user_trips]
        response_body["result"] = results
        response_body["message"] = f"Trips from user {user_id} got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code
    if request.method == "DELETE":
        data_input = request.json
        trip_id = data_input.get("trip_id", None)
        if not trip_id:
            response_body["result"] = None
            response_body["message"] = "The trip you want to delete is missing"
            return jsonify(response_body), 404
        trip_exists= db.session.execute(db.select(UserTrips).where(
        (UserTrips.user_id == user_id) & (UserTrips.trip_id == trip_id))).scalar()
        if not trip_exists:
            response_body["result"] = None
            response_body["message"] = f"Trip {trip_id} does not exist"
            return jsonify(response_body), 404
        db.session.delete(trip_exists)
        db.session.commit()
        response_body["result"] = None
        response_body["message"] = f"Trip {trip_id} deleted successfully from user {user_id}"
        return jsonify(response_body), 200


@api.route("/user-trips/trips/<int:trip_id>", methods=["GET", "DELETE"])
def handle_trip_users(trip_id):
    response_body = {}
    user_trips = db.session.execute(db.select(UserTrips).where(
        UserTrips.trip_id == trip_id)).scalar()
    if not user_trips:
        response_body["result"] = None
        response_body["message"] = f"Trip {trip_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        results = user_trips.serialize_trips()
        response_body["result"] = results
        response_body["message"] = f"Users from trip {trip_id} got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code
    if request.method == "DELETE":
        data_input = request.json
        user_id = data_input.get("user_id", None)
        if not user_id:
            response_body["result"] = None
            response_body["message"] = "The user you want to delete is missing"
            return jsonify(response_body), 404
        user_exists= db.session.execute(db.select(UserTrips).where(
        (UserTrips.user_id == user_id) & (UserTrips.trip_id == trip_id))).scalar()
        if not user_exists:
            response_body["result"] = None
            response_body["message"] = f"User {user_id} does not exist"
            return jsonify(response_body), 404
        db.session.delete(user_exists)
        db.session.commit()
        response_body["result"] = None
        response_body["message"] = f"User {user_id} deleted successfully from trip {trip_id}"
        return jsonify(response_body), 200


@api.route("/trips", methods=["GET", "POST"])
def handle_trips():
    response_body = {}
    trips = db.session.execute(
        db.select(Trips).order_by(asc(Trips.start_date))).scalars()
    if request.method == "GET":
        results = [row.serialize_relationships() for row in trips]
        response_body["results"] = results
        response_body["message"] = "Trips got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code
    if request.method == "POST":
        data = request.json
        trip_owner_id = data.get("trip_owner_id", None)
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
        response_body["message"] = f"User {trip_owner_id} now owns the trip {title}"
        return jsonify(response_body), 200


@api.route("/trips/<int:trip_id>", methods=["GET", "PUT", "DELETE"])
def handle_trip(trip_id):
    response_body = {}
    trip = db.session.execute(db.select(Trips).where(
        Trips.id == trip_id)).scalar()
    if not trip:
        response_body["result"] = None
        response_body["message"] = f"Trip {trip_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        results = trip.serialize_relationships()
        response_body["results"] = results
        response_body["message"] = f"Trip {trip.title} got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code
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
        db.session.delete(trip)
        db.session.commit()
        response_body["result"] = None
        response_body["message"] = f"Trip {trip.title} deleted successfully"
        return jsonify(response_body), 200
    