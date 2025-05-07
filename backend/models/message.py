from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from config import Config

client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
messages_collection = db['messages']
appointments_collection = db['appointments']
users_collection = db['users']

def validate_message_data(data):
    required_fields = ['sender_id', 'receiver_id', 'content']
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f'Champ "{field}" manquant ou vide')

def create_message(message_data):
    validate_message_data(message_data)
    message = {
        'sender_id': message_data['sender_id'],
        'receiver_id': message_data['receiver_id'],
        'content': message_data['content'],
        'created_at': datetime.now()
    }
    result = messages_collection.insert_one(message)
    return str(result.inserted_id)

def get_messages(sender_id, receiver_id):
    messages = list(messages_collection.find({
        '$or': [
            {'sender_id': sender_id, 'receiver_id': receiver_id},
            {'sender_id': receiver_id, 'receiver_id': sender_id}
        ]
    }))
    for message in messages:
        message['_id'] = str(message['_id'])
    return messages

def get_contacts(user_id, role=None):
    contacts = []
    # Si le rôle n'est pas défini, essayer de déterminer si c'est un médecin en vérifiant les rendez-vous
    if role is None:
        # Vérifier si l'utilisateur a des rendez-vous en tant que médecin
        doctor_appointments = appointments_collection.find({'doctor_id': user_id}).limit(1)
        if len(list(doctor_appointments)) > 0:
            role = 'doctor'
        else:
            role = 'client'  # Par défaut, considérer comme client
    
    if role == 'doctor':
        appointments = appointments_collection.find({'doctor_id': user_id, 'status': 'accepted'})
        client_ids = {str(appointment['user_id']) for appointment in appointments}
        contacts = list(users_collection.find({'_id': {'$in': [ObjectId(id) for id in client_ids]}})) if client_ids else []
    else:
        appointments = appointments_collection.find({'user_id': user_id, 'status': 'accepted'})
        doctor_ids = {str(appointment['doctor_id']) for appointment in appointments}
        contacts = list(users_collection.find({'_id': {'$in': [ObjectId(id) for id in doctor_ids]}})) if doctor_ids else []
    
    for contact in contacts:
        contact['_id'] = str(contact['_id'])
        contact.pop('password', None)
    return contacts