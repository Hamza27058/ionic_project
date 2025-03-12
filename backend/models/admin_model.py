from utils.db import db

class Admin:
    def __init__(self, nom, email, mot_de_passe):
        self.nom = nom
        self.email = email
        self.mot_de_passe = mot_de_passe

    def sauvegarder(self):
        db.admins.insert_one({
            "nom": self.nom,
            "email": self.email,
            "mot_de_passe": self.mot_de_passe
        })

    @staticmethod
    def trouver_par_email(email):
        return db.admins.find_one({"email": email})
