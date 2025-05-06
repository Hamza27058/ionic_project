from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from config import Config

client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
users_collection = db['users']
doctors_collection = db['doctors']

def get_all_users(role=None, skip=0, limit=20):
    """Récupère tous les utilisateurs avec filtrage par rôle"""
    query = {}
    if role:
        query['role'] = role
    
    users = list(users_collection.find(query).skip(skip).limit(limit))
    for user in users:
        user['_id'] = str(user['_id'])
        user.pop('password', None)  # Ne pas renvoyer les mots de passe
    
    return users

def get_all_doctors(skip=0, limit=20):
    """Récupère tous les médecins avec leurs informations détaillées"""
    doctors = list(doctors_collection.find().skip(skip).limit(limit))
    for doctor in doctors:
        doctor['_id'] = str(doctor['_id'])
        if 'user_id' in doctor:
            doctor['user_id'] = str(doctor['user_id'])
    
    return doctors

def delete_user(user_id):
    """Supprime un utilisateur par son ID"""
    # Vérifier si l'utilisateur est un médecin
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        return False
    
    # Si c'est un médecin, supprimer également ses informations dans la collection doctors
    if user.get('role') == 'doctor':
        doctors_collection.delete_one({'user_id': ObjectId(user_id)})
    
    # Supprimer l'utilisateur
    result = users_collection.delete_one({'_id': ObjectId(user_id)})
    return result.deleted_count > 0

def add_doctor(doctor_data, user_data):
    """Ajoute un nouveau médecin (crée à la fois un utilisateur et un profil de médecin)"""
    from models.user import create_user
    from models.doctor import create_doctor
    
    # Créer l'utilisateur avec le rôle 'doctor'
    user_id = create_user(user_data, role='doctor')
    
    # Ajouter les informations du médecin
    create_doctor(doctor_data, user_id)
    
    return user_id

def update_doctor_info(doctor_id, doctor_data):
    """Met à jour les informations d'un médecin"""
    result = doctors_collection.update_one(
        {'_id': ObjectId(doctor_id)},
        {'$set': {
            'name': doctor_data.get('name'),
            'surname': doctor_data.get('surname'),
            'specialty': doctor_data.get('specialty'),
            'city': doctor_data.get('city'),
            'photo': doctor_data.get('photo', ''),
            'updated_at': datetime.now()
        }}
    )
    return result.modified_count > 0

def is_admin(user_id):
    """Vérifie si un utilisateur est un administrateur"""
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    return user and user.get('role') == 'admin'
