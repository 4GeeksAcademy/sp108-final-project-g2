"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt
from sqlalchemy import asc

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
    role = user_to_post.get("role", "user")  # por defecto "user"

    if not email or not password:
        response_body["results"] = None
        response_body["message"] = "Email and password are required"
        return jsonify(response_body), 400

    # Verificar si ya existe el usuario
    existing_user = db.session.execute(
        db.select(Users).where(Users.email == email)).scalar()
    
    if existing_user:
        response_body["results"] = None
        response_body["message"] = f"Email address {email} is already in use"
        return jsonify(response_body), 409

    # Crear nuevo usuario
    user = Users()
    user.email = email
    user.password = password
    user.is_active = True
    user.first_name = user_to_post.get("first_name")
    user.last_name = user_to_post.get("last_name")
    user.role = role
    db.session.add(user)
    db.session.commit()

    # Claims para token JWT
    claims = {
        "user_id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name
    }

    access_token = create_access_token(
        identity=user.email, additional_claims=claims)

    # Respuesta
    response_body["results"] = user.serialize()
    response_body["access_token"] = access_token
    response_body["message"] = f"User {user.id} created successfully"
    return jsonify(response_body), 201


#  LOGIN

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

    # JWT con claims personalizados
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


# USUARIOS ACTIVOS
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


#  USUARIO AUTENTICADO
@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    response_body = {}

    claims = get_jwt()
    user_id = claims.get("user_id")

    user = db.session.execute(
        db.select(Users).where(Users.id == user_id, Users.is_active == True)
    ).scalar()

    if not user:
        response_body["results"] = None
        response_body["message"] = "User not found or inactive"
        return jsonify(response_body), 404

    response_body["results"] = user.serialize_relationships()
    response_body["message"] = f"User {user.id} retrieved successfully"
    return jsonify(response_body), 200


#  OBTENER / ACTUALIZAR / ELIMINAR USUARIO POR ID
@api.route("/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_user(user_id):
    response_body = {}

    user = db.session.execute(
        db.select(Users).where(Users.id == user_id)).scalar()

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

        user.email = data_input.get("email", user.email)
        user.password = data_input.get("password", user.password)
        user.first_name = data_input.get("first_name", user.first_name)
        user.last_name = data_input.get("last_name", user.last_name)

        db.session.commit()

        response_body["results"] = user.serialize()
        response_body["message"] = f"User {user.id} updated successfully"
        return jsonify(response_body), 200

    if request.method == "DELETE":
        if current_user_id != user_id:
            response_body["results"] = None
            response_body["message"] = f"User {current_user_id} is not authorized delete {user_id}"
            return jsonify(response_body), 403

        user.is_active = False
        db.session.commit()

        response_body["results"] = None
        response_body["message"] = f"User {user.id} deleted successfully"
        return jsonify(response_body), 200
