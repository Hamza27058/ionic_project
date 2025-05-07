from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from config import Config
import logging

logger = logging.getLogger(__name__)

client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
appointments_collection = db['appointments']
users_collection = db['users']
doctors_collection = db['doctors']

def validate_appointment_data(data):
    required_fields = ['doctor_id', 'user_id', 'date']
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f'Champ "{field}" manquant ou vide')

def validate_appointment_update(data):
    if 'status' not in data or not data['status']:
        raise ValueError('Champ "status" manquant ou vide')
    if data['status'] not in ['pending', 'accepted', 'rejected']:
        raise ValueError('Statut invalide')

def create_appointment(appointment_data):
    validate_appointment_data(appointment_data)
    appointment = {
        'doctor_id': appointment_data['doctor_id'],
        'user_id': appointment_data['user_id'],
        'date': appointment_data['date'],
        'status': 'pending',  # Ensure default status
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    result = appointments_collection.insert_one(appointment)
    return str(result.inserted_id)

def get_appointments(user_id):
    try:
        appointments = list(appointments_collection.find({'user_id': user_id}))
        result = []
        for appointment in appointments:
            try:
                # Ensure status is valid or set default
                status = appointment.get('status', 'pending')
                if status not in ['pending', 'accepted', 'rejected']:
                    status = 'pending'
                
                # Gérer les cas où user_id ou doctor_id pourrait être invalide
                user = None
                doctor = None
                
                try:
                    if 'user_id' in appointment and appointment['user_id']:
                        user = users_collection.find_one({'_id': ObjectId(appointment['user_id'])})
                except Exception as e:
                    logger.error(f"Error finding user: {str(e)}")
                
                try:
                    if 'doctor_id' in appointment and appointment['doctor_id']:
                        doctor = doctors_collection.find_one({'_id': ObjectId(appointment['doctor_id'])})
                except Exception as e:
                    logger.error(f"Error finding doctor: {str(e)}")
                
                appointment_data = {
                    '_id': str(appointment['_id']),
                    'doctor_id': appointment.get('doctor_id', ''),
                    'user_id': appointment.get('user_id', ''),
                    'date': appointment.get('date', ''),
                    'status': status,
                    'created_at': appointment.get('created_at', datetime.now()),
                    'updated_at': appointment.get('updated_at', appointment.get('created_at', datetime.now())),
                    'user_name': f"{user['name']} {user['surname']}" if user else 'Unknown',
                    'doctor_name': f"{doctor['name']} {doctor['surname']}" if doctor else 'Unknown'
                }
                result.append(appointment_data)
            except Exception as e:
                logger.error(f"Error processing appointment: {str(e)}")
                # Continue with the next appointment instead of failing completely
                continue
        return result
    except Exception as e:
        logger.error(f"Error in get_appointments: {str(e)}")
        # Return empty list instead of failing
        return []

def get_doctor_appointments(doctor_id):
    try:
        appointments = list(appointments_collection.find({'doctor_id': doctor_id}))
        result = []
        for appointment in appointments:
            try:
                status = appointment.get('status', 'pending')
                if status not in ['pending', 'accepted', 'rejected']:
                    status = 'pending'
                
                # Gérer les cas où user_id pourrait être invalide
                user = None
                
                try:
                    if 'user_id' in appointment and appointment['user_id']:
                        user = users_collection.find_one({'_id': ObjectId(appointment['user_id'])})
                except Exception as e:
                    logger.error(f"Error finding user: {str(e)}")
                
                appointment_data = {
                    '_id': str(appointment['_id']),
                    'doctor_id': appointment.get('doctor_id', ''),
                    'user_id': appointment.get('user_id', ''),
                    'date': appointment.get('date', ''),
                    'status': status,
                    'created_at': appointment.get('created_at', datetime.now()),
                    'updated_at': appointment.get('updated_at', appointment.get('created_at', datetime.now())),
                    'user_name': f"{user['name']} {user['surname']}" if user else 'Unknown',
                    'doctor_name': ''
                }
                result.append(appointment_data)
            except Exception as e:
                logger.error(f"Error processing doctor appointment: {str(e)}")
                # Continue with the next appointment instead of failing completely
                continue
        return result
    except Exception as e:
        logger.error(f"Error in get_doctor_appointments: {str(e)}")
        # Return empty list instead of failing
        return []

def update_appointment(appointment_id, update_data, doctor_id):
    validate_appointment_update(update_data)
    appointment = appointments_collection.find_one({'_id': ObjectId(appointment_id)})
    if not appointment:
        raise ValueError('Rendez-vous non trouvé')
    
    # Vérifier si l'utilisateur est le médecin associé au rendez-vous
    user = users_collection.find_one({'_id': ObjectId(doctor_id)})
    if not user or user.get('role') != 'doctor':
        # Si ce n'est pas un médecin, vérifier si c'est bien le médecin associé au rendez-vous
        if appointment['doctor_id'] != doctor_id:
            raise ValueError('Accès non autorisé')
    
    result = appointments_collection.update_one(
        {'_id': ObjectId(appointment_id)},
        {'$set': {'status': update_data['status'], 'updated_at': datetime.now()}}
    )
    return result.modified_count > 0