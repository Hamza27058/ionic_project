from flask import Blueprint, request, jsonify
from models.user import get_all_users, get_user_by_id, delete_user
from models.doctor import create_doctor, get_doctors, delete_doctor
from utils.auth import login_required, admin_required
import logging
import bcrypt

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)

# Route pour récupérer tous les utilisateurs
@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users(user_id):
    """Récupérer tous les utilisateurs (pour l'administrateur)"""
    try:
        # Récupérer tous les utilisateurs depuis le modèle
        users = get_all_users()
        logger.info(f"Admin {user_id} retrieved all users: {len(users)} users found")
        return jsonify(users)
    except Exception as e:
        logger.error(f"Error retrieving users: {str(e)}")
        # Renvoyer une liste vide en cas d'erreur plutôt qu'une erreur 500
        return jsonify([])

@admin_bp.route('/admin/users/<user_id>', methods=['DELETE'])
@login_required
@admin_required
def remove_user(user_id_to_delete, user_id):  # Renommer le paramètre user_id en user_id_to_delete pour éviter la confusion avec le paramètre user_id du décorateur
    """Supprimer un utilisateur (pour l'administrateur)"""
    try:
        if delete_user(user_id_to_delete):
            logger.info(f"Admin {user_id} deleted user {user_id_to_delete}")
            return jsonify({'message': 'Utilisateur supprimé avec succès'})
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Route pour l'ajout de médecins par l'administrateur
@admin_bp.route('/admin/doctors/add', methods=['POST'])
@login_required
@admin_required
def add_doctor(user_id):  # user_id est fourni par le décorateur login_required
    """Ajouter un médecin (pour l'administrateur)"""
    try:
        # Vérifier si les données JSON sont présentes
        data = request.json
        logger.info(f"Received doctor data: {data}")
        
        if not data:
            logger.error("No data provided")
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        # Vérifier uniquement les champs essentiels
        required_fields = ['name', 'surname', 'email', 'password']
        
        # Log complet des données reçues pour déboguer
        logger.info(f"Received data keys: {data.keys()}")
        logger.info(f"Specialty value: {data.get('specialty', 'NOT FOUND')}")
        
        # Vérifier uniquement les champs essentiels
        for field in required_fields:
            if field not in data or not data[field]:
                logger.error(f"Essential field missing or empty: {field}")
                return jsonify({'error': f'Champ "{field}" manquant ou vide'}), 400
        
        # IMPORTANT: Toujours définir explicitement les valeurs par défaut
        # pour les champs optionnels, même s'ils existent déjà dans les données
        
        # Spécialité par défaut
        if 'specialty' not in data or not data.get('specialty') or data.get('specialty') == '':
            data['specialty'] = 'Généraliste'
            logger.info("Using default specialty: Généraliste")
        else:
            logger.info(f"Using provided specialty: {data['specialty']}")
        
        # Ville par défaut
        if 'city' not in data or not data.get('city') or data.get('city') == '':
            data['city'] = 'Non spécifiée'
            logger.info("Using default city: Non spécifiée")
        else:
            logger.info(f"Using provided city: {data['city']}")
        
        # Vérifier si l'email existe déjà
        from models.user import get_user_by_email
        existing_user = get_user_by_email(data['email'])
        if existing_user:
            logger.error(f"Email already exists: {data['email']}")
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
        
        try:
            # Hacher le mot de passe
            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            
            # Créer l'utilisateur avec le rôle médecin
            from models.user import create_user
            user_data = {
                'name': data['name'],
                'surname': data['surname'],
                'email': data['email'],
                'password': hashed_password
            }
            logger.info(f"Creating user with data: {user_data}")
            user_id = create_user(user_data, role='doctor')
            logger.info(f"User created with ID: {user_id}")
            
            # Ajouter les informations du médecin
            doctor_data = {
                'name': data['name'],
                'surname': data['surname'],
                'specialty': data['specialty'],
                'city': data['city'],
                'photo': data.get('photo', '')
            }
            logger.info(f"Creating doctor with data: {doctor_data}")
            
            # Utiliser un bloc try/except spécifique pour la création du médecin
            try:
                from models.doctor import create_doctor
                create_doctor(doctor_data, user_id)
                logger.info(f"Doctor created for user ID: {user_id}")
            except Exception as doctor_error:
                # Si la création du médecin échoue, supprimer l'utilisateur créé
                logger.error(f"Error creating doctor, rolling back user creation: {str(doctor_error)}")
                from models.user import delete_user
                delete_user(user_id)
                raise Exception(f"Erreur lors de la création du médecin: {str(doctor_error)}")
            
            logger.info(f"Admin {user_id} successfully created doctor {user_id}")
            return jsonify({'message': 'Médecin ajouté avec succès', 'doctor_id': user_id})
            
        except Exception as user_error:
            logger.error(f"Error in user/doctor creation process: {str(user_error)}")
            return jsonify({'error': f'Erreur lors de la création: {str(user_error)}'}), 500
            
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error creating doctor: {str(e)}")
        return jsonify({'error': 'Erreur serveur inattendue', 'details': str(e)}), 500

@admin_bp.route('/admin/doctors/<doctor_id>', methods=['DELETE'])
@login_required
@admin_required
def remove_doctor(doctor_id, user_id):  # Changer admin_id en user_id pour correspondre aux décorateurs
    """Supprimer un médecin (pour l'administrateur)"""
    try:
        # Supprimer le médecin de la collection doctors
        if delete_doctor(doctor_id):
            # Supprimer également l'utilisateur correspondant
            delete_user(doctor_id)
            logger.info(f"Admin {user_id} deleted doctor {doctor_id}")
            return jsonify({'message': 'Médecin supprimé avec succès'})
        return jsonify({'error': 'Médecin non trouvé'}), 404
    except Exception as e:
        logger.error(f"Error deleting doctor: {str(e)}")
        return jsonify({'error': str(e)}), 500
