from flask import Blueprint, request, jsonify
from models.admin_model import Admin

admin_routes = Blueprint('admin_routes', __name__)

@admin_routes.route('/admin/inscription', methods=['POST'])
def inscription_admin():
    data = request.json
    nom = data.get('nom')
    email = data.get('email')
    mot_de_passe = data.get('mot_de_passe')

    if Admin.trouver_par_email(email):
        return jsonify({"message": "Admin déjà inscrit"}), 400

    admin = Admin(nom, email, mot_de_passe)
    admin.sauvegarder()
    return jsonify({"message": "Admin inscrit avec succès"}), 201
