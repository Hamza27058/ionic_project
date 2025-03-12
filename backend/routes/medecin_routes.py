from flask import Blueprint, request, jsonify
from models.medecin_model import Medecin
from utils.db import db

medecin_routes = Blueprint('medecin_routes', __name__)

@medecin_routes.route('/medecins', methods=['GET'])
def obtenir_medecins():
    # Ensure to fetch the medecins from the database
    medecins = list(db.medecins.find({}))
    return jsonify(medecins), 200
