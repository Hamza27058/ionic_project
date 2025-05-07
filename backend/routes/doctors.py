from flask import Blueprint, jsonify
from models.doctor import get_doctors, get_doctors_by_specialty
import logging

doctors_bp = Blueprint('doctors', __name__)
logger = logging.getLogger(__name__)

@doctors_bp.route('/doctors', methods=['GET'])
def get_all_doctors():
    try:
        doctors = get_doctors()
        logger.info("Retrieved all doctors")
        return jsonify(doctors)
    except Exception as e:
        logger.error(f"Error retrieving doctors: {str(e)}")
        # Retourner une liste vide au lieu d'une erreur
        return jsonify([])

@doctors_bp.route('/doctors/<specialty>', methods=['GET'])
def get_specialty_doctors(specialty):
    try:
        doctors = get_doctors_by_specialty(specialty)
        logger.info(f"Retrieved doctors for specialty: {specialty}")
        return jsonify(doctors)
    except Exception as e:
        logger.error(f"Error retrieving specialty doctors: {str(e)}")
        # Retourner une liste vide au lieu d'une erreur
        return jsonify([])