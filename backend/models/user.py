from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import bcrypt
from config import Config
import re

client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
users_collection = db['users']

def validate_user_data(data, is_doctor=False):
    required_fields = ['name', 'surname', 'email', 'password']
    if is_doctor:
        required_fields.extend(['specialty', 'city'])
    
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f'Champ "{field}" manquant ou vide')
    
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, data['email']):
        raise ValueError('Email invalide')
    
    if len(data['password']) < 6:
        raise ValueError('Le mot de passe doit contenir au moins 6 caractères')

def create_user(user_data, role='client'):
    validate_user_data(user_data, role == 'doctor')
    
    if users_collection.find_one({'email': user_data['email']}):
        raise ValueError('Cet email existe déjà')
    
    hashed_password = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt())
    user = {
        'name': user_data['name'],
        'surname': user_data['surname'],
        'email': user_data['email'],
        'password': hashed_password,
        'role': role,
        'created_at': datetime.now(),
        'favorites': [],
        'photo': ''  # Default empty photo URL
    }
    if role == 'doctor':
        user.update({
            'specialty': user_data['specialty'],
            'city': user_data['city']
        })
    result = users_collection.insert_one(user)
    return str(result.inserted_id)

def get_user_by_email(email):
    return users_collection.find_one({'email': email})

def get_user_by_id(user_id):
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    if user:
        user['_id'] = str(user['_id'])
        user.pop('password', None)
    return user

def update_user(user_id, update_data):
    validate_update_data = {}
    for field in ['name', 'surname', 'email', 'specialty', 'city', 'photo']:
        if field in update_data and update_data[field]:
            validate_update_data[field] = update_data[field]
    
    if 'password' in update_data and update_data['password']:
        if update_data['password'] != update_data.get('confirmPassword'):
            raise ValueError('Les mots de passe ne correspondent pas')
        if len(update_data['password']) < 6:
            raise ValueError('Le mot de passe doit contenir au moins 6 caractères')
        validate_update_data['password'] = bcrypt.hashpw(update_data['password'].encode('utf-8'), bcrypt.gensalt())
    
    if not validate_update_data:
        raise ValueError('Aucune donnée valide fournie')
    
    validate_update_data['updated_at'] = datetime.now()
    result = users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': validate_update_data}
    )
    return result.modified_count > 0

def get_all_users():
    """Récupérer tous les utilisateurs de la base de données"""
    try:
        # Récupérer tous les utilisateurs
        users = list(users_collection.find())
        
        # Formater les données pour le JSON
        formatted_users = []
        for user in users:
            # Convertir l'ObjectId en chaîne
            user_dict = {
                '_id': str(user['_id']),
                'name': user.get('name', ''),
                'surname': user.get('surname', ''),
                'email': user.get('email', ''),
                'role': user.get('role', 'client'),
                'created_at': user.get('created_at', datetime.now()).isoformat() if isinstance(user.get('created_at'), datetime) else user.get('created_at', ''),
                'photo': user.get('photo', '')
            }
            formatted_users.append(user_dict)
        
        return formatted_users
    except Exception as e:
        print(f"Erreur lors de la récupération des utilisateurs: {str(e)}")
        # En cas d'erreur, renvoyer une liste vide plutôt que de lever une exception
        return []

def delete_user(user_id):
    """Supprimer un utilisateur par son ID"""
    try:
        result = users_collection.delete_one({'_id': ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception as e:
        return False