from models.admin_model import Admin

class AdminService:
    @staticmethod
    def inscrire_admin(nom, email, mot_de_passe):
        if Admin.trouver_par_email(email):
            return {"message": "Admin déjà inscrit"}, 400

        admin = Admin(nom, email, mot_de_passe)
        admin.sauvegarder()
        return {"message": "Admin inscrit avec succès"}, 201
