from flask import Blueprint, request, jsonify
from models.patient_model import Patient
from utils.db import db

patient_routes = Blueprint('patient_routes', __name__)

@patient_routes.route('/inscription', methods=['POST'])
def inscription_patient():
    data = request.json
    nom = data.get('nom')
    email = data.get('email')
    telephone = data.get('telephone')

    # Validation checks
    if not nom:
        return jsonify({"error": "Le nom ne peut pas être vide."}), 400
    if not email or "@" not in email:
        return jsonify({"error": "Email invalide."}), 400
    if not telephone.isdigit():
        return jsonify({"error": "Le téléphone doit être un numéro valide."}), 400

    if Patient.trouver_par_email(email):
        return jsonify({"message": "Patient déjà inscrit"}), 400

    patient = Patient(nom, email, telephone) 
    patient.sauvegarder()
    return jsonify({"message": "Patient inscrit avec succès"}), 201

@patient_routes.route('/patients', methods=['GET'])
def obtenir_patients():
    patients = list(db.patients.find({}))
    # Convert ObjectId to string
    for patient in patients:
        patient['_id'] = str(patient['_id'])  # Convert ObjectId to string
    return jsonify(patients), 200
