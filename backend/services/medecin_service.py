from models.medecin_model import Medecin
from utils.db import db

class MedecinService:
    @staticmethod
    def obtenir_medecins():
        medecins = list(db.medecins.find({}))
        return medecins, 200
