from flask import Blueprint, request, jsonify
from models.rendezvous_model import RendezVous
from utils.db import db

rendezvous_routes = Blueprint('rendezvous_routes', __name__)

@rendezvous_routes.route('/rendezvous', methods=['POST'])
def creer_rendezvous():
    data = request.json
    patient_id = data.get('patient_id')
    medecin_id = data.get('medecin_id')
    date = data.get('date')

    rendezvous = RendezVous(patient_id, medecin_id, date)
    rendezvous.sauvegarder()
    return jsonify({"message": "Rendez-vous créé avec succès"}), 201
