from datetime import datetime
from utils.db import db

class RendezVous:
    def __init__(self, patient_id, medecin_id, date, statut="en_attente"):
        self.patient_id = patient_id
        self.medecin_id = medecin_id
        self.date = date
        self.statut = statut

    def sauvegarder(self):
        db.rendezvous.insert_one({
            "patient_id": self.patient_id,
            "medecin_id": self.medecin_id,
            "date": self.date,
            "statut": self.statut
        })
