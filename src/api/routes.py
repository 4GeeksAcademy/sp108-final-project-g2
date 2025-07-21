"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users , Activities , ActivitiesHistory

api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200


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
@api.route('/activities', methods =[ ' GET' , 'POST' ])
def handle_activity():
    response_body ={}
    if request.method == 'GET':
        rows =db.session.execute(db.Select(Activities)).scalars() #Consultamos todas las actividades
        response_body['results'] = [row.serilize() for row in rows]
        response_body['message'] = 'listado de actividades'
        return response_body, 200
    if request.method == 'POST':
        data = request.get_json() #Creamos la actividad
        new = Activities(
            trip_id =data.get('tip_id'),
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
def uppdate_activity(id):
    response_boy= {}

    activity = Activitites.query.get_or_404(id) #Busca id o regresa un error 404
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

@api.route('/history-media' ,  methods = ['GET' ])
def handle_history_media():
    response_body={}
    rows = db.session.execute(db.select(ActivitiesHistory)).scalars()
    response_body['results'] = [row.serilize() for row in rows]
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

