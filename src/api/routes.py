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


@api.route("/signup", methods=["POST"])
def register():
    response_body = {}
    user_to_post = request.json
    user = Users()
    user.email = user_to_post.get("email").lower()
    existing_user = db.session.execute(
        db.select(Users).where(Users.email == user.email)).scalar()
    if existing_user:
        response_body["results"] = None
        response_body["message"] = f"Email address {user.email} is already been used"
        return jsonify(response_body), 409
    user.password = user_to_post.get("password")
    user.is_active = user_to_post.get("is_active")
    user.is_admin = user_to_post.get("is_admin")
    user.first_name = user_to_post.get("first_name")
    user.last_name = user_to_post.get("last_name")
    db.session.add(user)
    db.session.commit()

    claims = {"user_id": user.id,
              "email": user.email,
              "is_active": user.is_active,
              "is_admin": user.is_admin,
              "first_name": user.first_name,
              "last_name": user.last_name,
              "followers": [row.serialize()["follower_id"] for row in user.following_to],
              "following": [row.serialize()["following_id"] for row in user.follower_to]}
    access_token = create_access_token(
        identity=user.email, additional_claims=claims)

    response_body["results"] = user.serialize()
    response_body["access_token"] = access_token
    response_body["message"] = f"User {user.id} posted successfully"
    return jsonify(response_body), 201


# Login access token
@api.route("/login", methods=["POST"])
def login():
    response_body = {}
    user_to_login = request.json
    email = user_to_login.get("email", None).lower()
    password = user_to_login.get("password", None)
    user = db.session.execute(db.select(Users).where(Users.email == email,
                                                     Users.password == password,
                                                     Users.is_active == True)).scalar()

    if not user:
        response_body["message"] = "Bad email or password"
        return jsonify(response_body), 401

    claims = {"user_id": user.id,
              "email": user.email,
              "is_active": user.is_active,
              "is_admin": user.is_admin,
              "first_name": user.first_name,
              "last_name": user.last_name,
              "followers": [row.serialize()["follower_id"] for row in user.following_to],
              "following": [row.serialize()["following_id"] for row in user.follower_to]}
    access_token = create_access_token(
        identity=email, additional_claims=claims)

    response_body["access_token"] = access_token
    response_body["results"] = user.serialize()
    response_body["message"] = f"User {user.email} logged successfully"
    return jsonify(response_body), 200


# Protected route for users
@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # Access the identity of the current user with get_jwt_identity
    response_body = {}
    current_user = get_jwt_identity()
    additional_claims = get_jwt()
    response_body["current_user"] = current_user
    response_body["additional_claims"] = additional_claims
    return jsonify(response_body), 200


@api.route("/users", methods=["GET", "POST"])
def handle_users():
    response_body = {}
    users = db.session.execute(db.select(Users).where(
        Users.is_active == True).order_by(asc(Users.id))).scalars()
    results = [row.serialize() for row in users]
    response_body["results"] = results
    response_body["message"] = "Users got successfully"
    status_code = 200 if results else 404
    return jsonify(response_body), status_code


@api.route("/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_user(user_id):
    response_body = {}
    claims = get_jwt()
    user = db.session.execute(
        db.select(Users).where(Users.id == user_id)).scalar()
    if not user:
        response_body["result"] = None
        response_body["message"] = f"User {user_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        response_body["result"] = user.serialize()
        response_body["message"] = f"User {user.id} got successfully"
        return jsonify(response_body), 200
    if request.method == "PUT":
        if claims["user_id"] != user_id:
            response_body["message"] = f"User {claims["user_id"]} is not allowed to put user {user_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        data_input = request.json
        user.email = data_input.get("email", user.email)
        user.password = data_input.get("password", user.password)
        # user.is_active = True
        user.first_name = data_input.get("first_name", user.first_name)
        user.last_name = data_input.get("last_name", user.last_name)
        db.session.commit()
        response_body["result"] = user.serialize()
        response_body["message"] = f"User {user.id} put successfully"
        return jsonify(response_body), 200
    if request.method == "DELETE":
        if claims["user_id"] != user_id:
            response_body["message"] = f"User {claims["user_id"]} is not allowed to delete user {user_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        user.is_active = False
        db.session.commit()
        response_body["result"] = None
        response_body["message"] = f"User {user.id} deleted successfully"
        return jsonify(response_body), 200


@api.route("/user-trips", methods=["GET"])
def handle_users_trips():
    if request.method == "GET":
        response_body = {}
        users_trips = db.session.execute(db.select(UserTrips)).scalars()
        results = [row.serialize() for row in users_trips]
        response_body["results"] = results
        response_body["message"] = "User trips got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code


@api.route("/user-trips/<int:user_id>", methods=["GET"])
def handle_user_trips(user_id):
    response_body = {}
    user_trips = db.session.execute(db.select(UserTrips).where(
        UserTrips.user_id == user_id)).scalar()
    if not user_trips:
        response_body["result"] = None
        response_body["message"] = f"User {user_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        results = user_trips.serialize()
        response_body["results"] = results
        response_body["message"] = f"Trips from {UserTrips.user_id} got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code


"""  response_body = {}
    claims = get_jwt()
    
    if not user:
        response_body["result"] = None
        response_body["message"] = f"User {user_id} not found"
        return jsonify(response_body), 404
    if request.method == "GET":
        response_body["result"] = user.serialize()
        response_body["message"] = f"User {user.id} got successfully"
        return jsonify(response_body), 200
    if request.method == "PUT":
        if claims["user_id"] != user_id:
            response_body["message"] = f"User {claims["user_id"]} is not allowed to put user {user_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        data_input = request.json
        user.email = data_input.get("email", user.email)
        user.password = data_input.get("password", user.password)
        # user.is_active = True
        user.first_name = data_input.get("first_name", user.first_name)
        user.last_name = data_input.get("last_name", user.last_name)
        db.session.commit()
        response_body["result"] = user.serialize()
        response_body["message"] = f"User {user.id} put successfully"
        return jsonify(response_body), 200
    if request.method == "DELETE":
        if claims["user_id"] != user_id:
            response_body["message"] = f"User {claims["user_id"]} is not allowed to delete user {user_id}"
            response_body["result"] = None
            return jsonify(response_body), 403
        user.is_active = False
        db.session.commit()
        response_body["result"] = None
        response_body["message"] = f"User {user.id} deleted successfully"
        return jsonify(response_body), 200 """


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


@api.route("/trips/<int:trip_id>", methods=["GET"])
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
        response_body["message"] = f"Trip {trip_id} got successfully"
        status_code = 200 if results else 404
        return jsonify(response_body), status_code
