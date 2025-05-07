from pymongo import MongoClient
from datetime import datetime
from config import Config

# Connexion à la base de données MongoDB
client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
rendezvous_collection = db['appointments']  # Utiliser la même collection que dans appointment.py

class RendezVous:
    def __init__(self, patient_id: str, medecin_id: str, date: str):
        """
        Initialiser un objet RendezVous.

        Args:
            patient_id (str): ID du patient
            medecin_id (str): ID du médecin
            date (str): Date et heure du rendez-vous (format ISO)
        """
        self.data = {
            'user_id': patient_id,      # Correspond à user_id dans appointment.py
            'doctor_id': medecin_id,    # Correspond à doctor_id dans appointment.py
            'date': date,               # Date du rendez-vous
            'status': 'pending',        # Statut par défaut
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

    def sauvegarder(self) -> str:
        """
        Sauvegarder le rendez-vous dans la base de données.

        Returns:
            str: ID du rendez-vous créé
        """
        try:
            # Validation des champs requis
            required_fields = ['user_id', 'doctor_id', 'date']
            for field in required_fields:
                if field not in self.data or not self.data[field]:
                    raise ValueError(f'Champ "{field}" manquant ou vide')

            # Insérer dans la collection
            result = rendezvous_collection.insert_one(self.data)
            return str(result.inserted_id)
        except Exception as e:
            raise Exception(f"Erreur lors de la sauvegarde du rendez-vous : {str(e)}")