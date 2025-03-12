from utils.db import db

class Medecin:
    def __init__(self, nom, specialite, email, telephone):
        self.nom = nom
        self.specialite = specialite
        self.email = email
        self.telephone = telephone

    def sauvegarder(self):
        db.medecins.insert_one({
            "nom": self.nom,
            "specialite": self.specialite,
            "email": self.email,
            "telephone": self.telephone
        })

    @staticmethod
    def trouver_par_email(email):
        return db.medecins.find_one({"email": email})
