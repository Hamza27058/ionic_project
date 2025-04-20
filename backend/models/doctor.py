from pymongo import MongoClient
from bson import ObjectId
from config import Config

client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
doctors_collection = db['doctors']

def validate_doctor_data(data):
    required_fields = ['name', 'surname', 'specialty', 'city']
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f'Champ "{field}" manquant ou vide')

def create_doctor(doctor_data, user_id):
    validate_doctor_data(doctor_data)
    doctor = {
        '_id': ObjectId(user_id),
        'name': doctor_data['name'],
        'surname': doctor_data['surname'],
        'specialty': doctor_data['specialty'],
        'city': doctor_data['city'],
        'rating': 0,
        'photo': doctor_data.get('photo', '')
    }
    doctors_collection.insert_one(doctor)

def get_doctors():
    doctors = list(doctors_collection.find())
    for doctor in doctors:
        doctor['_id'] = str(doctor['_id'])
    return doctors

def get_doctors_by_specialty(specialty):
    doctors = list(doctors_collection.find({'specialty': specialty}))
    for doctor in doctors:
        doctor['_id'] = str(doctor['_id'])
    return doctors