from flask import Blueprint, request, jsonify
from models.admin import get_all_users, get_all_doctors, delete_user, add_doctor, update_doctor_info, is_admin
from utils.auth import login_required, admin_required
import logging

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)

@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users(user_id):
    """Récupère tous les utilisateurs (filtrage optionnel par rôle)"""
    try:
        role = request.args.get('role')
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        
        users = get_all_users(role, skip, limit)
        return jsonify(users)
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@admin_bp.route('/doctors', methods=['GET'])
@login_required
@admin_required
def get_doctors(user_id):
    """Récupère tous les médecins"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        
        doctors = get_all_doctors(skip, limit)
        return jsonify(doctors)
    except Exception as e:
        logger.error(f"Error getting doctors: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@login_required
@admin_required
def remove_user(admin_id, user_id):
    """Supprime un utilisateur"""
    try:
        if delete_user(user_id):
            return jsonify({'message': 'Utilisateur supprimé avec succès'})
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@admin_bp.route('/doctors', methods=['POST'])
@login_required
@admin_required
def create_doctor(admin_id):
    """Ajoute un nouveau médecin"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        # Séparer les données utilisateur et médecin
        user_data = {
            'name': data.get('name'),
            'surname': data.get('surname'),
            'email': data.get('email'),
            'password': data.get('password'),
            'specialty': data.get('specialty'),
            'city': data.get('city')
        }
        
        doctor_data = {
            'name': data.get('name'),
            'surname': data.get('surname'),
            'specialty': data.get('specialty'),
            'city': data.get('city'),
            'photo': data.get('photo', '')
        }
        
        user_id = add_doctor(doctor_data, user_data)
        return jsonify({'message': 'Médecin ajouté avec succès', 'user_id': user_id})
    except ValueError as e:
        logger.error(f"Error adding doctor: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@admin_bp.route('/doctors/<doctor_id>', methods=['PUT'])
@login_required
@admin_required
def update_doctor(admin_id, doctor_id):
    """Met à jour les informations d'un médecin"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        if update_doctor_info(doctor_id, data):
            return jsonify({'message': 'Informations du médecin mises à jour avec succès'})
        return jsonify({'error': 'Médecin non trouvé ou aucune modification effectuée'}), 404
    except Exception as e:
        logger.error(f"Error updating doctor: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@admin_bp.route('/check-admin', methods=['GET'])
@login_required
def check_admin_status(user_id):
    """Vérifie si l'utilisateur connecté est un administrateur"""
    try:
        admin_status = is_admin(user_id)
        return jsonify({'is_admin': admin_status})
    except Exception as e:
        logger.error(f"Error checking admin status: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500
