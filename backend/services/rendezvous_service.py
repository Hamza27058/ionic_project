from models.rendezvous_model import RendezVous
from utils.db import db

class RendezVousService:
    @staticmethod
    def creer_rendezvous(patient_id, medecin_id, date):
        rendezvous = RendezVous(patient_id, medecin_id, date)
        rendezvous.sauvegarder()
        return {"message": "Rendez-vous créé avec succès"}, 201
