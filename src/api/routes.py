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
