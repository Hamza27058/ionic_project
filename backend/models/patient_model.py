from utils.db import db

class Patient:
    def __init__(self, nom, email, telephone, historique_medical=None):
        self.nom = nom
        self.email = email
        self.telephone = telephone
        self.historique_medical = historique_medical or []

    def sauvegarder(self):
        db.patients.insert_one({
            "nom": self.nom,
            "email": self.email,
            "telephone": self.telephone,
            "historique_medical": self.historique_medical
        })

    @staticmethod
    def trouver_par_email(email):
        return db.patients.find_one({"email": email})
