from flask import Blueprint, request, jsonify, send_from_directory
from models.user import create_user, get_user_by_email, get_user_by_id, update_user
from models.doctor import create_doctor  # Import create_doctor
from utils.auth import generate_token, login_required
import logging
import os
from werkzeug.utils import secure_filename
import bcrypt

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            raise ValueError('Aucune donnée fournie')
        user_id = create_user(data, role='client')
        token = generate_token(user_id)
        logger.info(f"User registered: {data['email']}")
        return jsonify({'token': token, 'user_id': user_id})
    except ValueError as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@auth_bp.route('/doctor-register', methods=['POST'])
def doctor_register():
    try:
        data = request.json
        if not data:
            raise ValueError('Aucune donnée fournie')
        user_id = create_user(data, role='doctor')
        
        # Add doctor to doctors collection
        doctor_data = {
            'name': data['name'],
            'surname': data['surname'],
            'specialty': data['specialty'],
            'city': data['city'],
            'photo': data.get('photo', '')
        }
        create_doctor(doctor_data, user_id)
        
        token = generate_token(user_id)
        logger.info(f"Doctor registered: {data['email']}")
        return jsonify({'token': token, 'user_id': user_id})
    except ValueError as e:
        logger.error(f"Doctor registration error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            raise ValueError('Email ou mot de passe manquant')
        
        user = get_user_by_email(data['email'])
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            token = generate_token(str(user['_id']))
            logger.info(f"User logged in: {data['email']}")
            return jsonify({
                'token': token, 
                'user_id': str(user['_id']),
                'user_type': user.get('role', 'client')
            })
        raise ValueError('Identifiants invalides')
    except ValueError as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        logger.error(f"Server error in login: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_profile(user_id):
    try:
        user = get_user_by_id(user_id)
        if user:
            logger.info(f"Profile retrieved: {user_id}")
            return jsonify(user)
        raise ValueError('Utilisateur non trouvé')
    except ValueError as e:
        logger.error(f"Profile error: {str(e)}")
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile(user_id):
    try:
        data = request.json
        if not data:
            raise ValueError('Aucune donnée fournie')
        if update_user(user_id, data):
            logger.info(f"Profile updated: {user_id}")
            return jsonify({'message': 'Profil mis à jour'})
        raise ValueError('Aucune modification effectuée')
    except ValueError as e:
        logger.error(f"Profile update error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@auth_bp.route('/profile/photo', methods=['POST'])
@login_required
def upload_profile_photo(user_id):
    try:
        if 'photo' not in request.files:
            raise ValueError('Aucune photo fournie')
        file = request.files['photo']
        if file.filename == '':
            raise ValueError('Nom de fichier vide')
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, f"{user_id}_{filename}")
            file.save(file_path)
            photo_url = f"/uploads/{user_id}_{filename}"
            update_user(user_id, {'photo': photo_url})
            logger.info(f"Profile photo uploaded for user: {user_id}")
            return jsonify({'message': 'Photo de profil mise à jour', 'photo_url': photo_url})
        raise ValueError('Type de fichier non autorisé')
    except ValueError as e:
        logger.error(f"Photo upload error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@auth_bp.route('/uploads/<filename>', methods=['GET'])
def serve_photo(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)