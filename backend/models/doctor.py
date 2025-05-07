from pymongo import MongoClient
from bson import ObjectId
from config import Config

client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
doctors_collection = db['doctors']

def validate_doctor_data(data):
    """Valider les données du médecin"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Log des données reçues pour déboguer
    logger.info(f"Validating doctor data: {data}")
    
    # S'assurer que les champs requis existent
    required_fields = ['name', 'surname']
    for field in required_fields:
        if field not in data or not data[field]:
            logger.error(f"Required field missing or empty: {field}")
            raise ValueError(f'Champ "{field}" manquant ou vide')
    
    # Gérer spécifiquement le champ specialty
    if 'specialty' not in data or not data.get('specialty'):
        # Utiliser une valeur par défaut si la spécialité est manquante
        logger.warning("Specialty missing, using default value")
        data['specialty'] = 'Généraliste'
    
    # Gérer spécifiquement le champ city
    if 'city' not in data or not data.get('city'):
        # Utiliser une valeur par défaut si la ville est manquante
        logger.warning("City missing, using default value")
        data['city'] = 'Non spécifiée'
    
    logger.info("Doctor data validation successful with data: " + str(data))

def create_doctor(doctor_data, user_id):
    """Créer un nouveau médecin dans la base de données"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Valider les données du médecin (cette fonction peut modifier doctor_data)
        validate_doctor_data(doctor_data)
        
        # S'assurer que user_id est une chaîne de caractères
        user_id_str = str(user_id)
        
        # Créer le document du médecin avec des valeurs par défaut si nécessaire
        doctor = {
            '_id': ObjectId(user_id_str),
            'name': doctor_data['name'],
            'surname': doctor_data['surname'],
            'specialty': doctor_data.get('specialty', 'Généraliste'),  # Valeur par défaut si manquante
            'city': doctor_data.get('city', 'Non spécifiée'),  # Valeur par défaut si manquante
            'rating': 0,
            'photo': doctor_data.get('photo', '')
        }
        
        logger.info(f"Creating doctor document: {doctor}")
        
        # Insérer le document dans la collection
        result = doctors_collection.insert_one(doctor)
        
        # Vérifier que l'insertion a réussi
        if not result.acknowledged:
            logger.error("Doctor insertion failed")
            raise Exception("L'insertion du médecin a échoué")
        
        logger.info(f"Doctor created successfully with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error in create_doctor: {str(e)}")
        # Propager l'erreur pour qu'elle soit gérée par l'appelant
        raise Exception(f"Erreur lors de la création du médecin: {str(e)}")


def get_doctors():
    try:
        doctors = list(doctors_collection.find())
        for doctor in doctors:
            doctor['_id'] = str(doctor['_id'])
        return doctors
    except Exception as e:
        # En cas d'erreur, retourner une liste vide
        return []

def get_doctors_by_specialty(specialty):
    try:
        doctors = list(doctors_collection.find({'specialty': specialty}))
        for doctor in doctors:
            doctor['_id'] = str(doctor['_id'])
        return doctors
    except Exception as e:
        # En cas d'erreur, retourner une liste vide
        return []

def delete_doctor(doctor_id):
    """Supprimer un médecin par son ID"""
    try:
        result = doctors_collection.delete_one({'_id': ObjectId(doctor_id)})
        return result.deleted_count > 0
    except Exception as e:
        return False