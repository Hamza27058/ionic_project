import jwt
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from config import Config
import logging

logger = logging.getLogger(__name__)

def generate_token(user_id: str) -> str:
    return jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        },
        Config.SECRET_KEY,
        algorithm="HS256"
    )

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            logger.warning("No token provided")
            return jsonify({'error': 'Token requis'}), 401
        try:
            token = token.replace('Bearer ', '')
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            kwargs['user_id'] = data['user_id']
        except jwt.ExpiredSignatureError:
            logger.warning("Expired token")
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            logger.error(f"Token decode error: {str(e)}")
            return jsonify({'error': 'Erreur de décodage', 'details': str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = kwargs.get('user_id')
        if not user_id:
            return jsonify({'error': 'Utilisateur non authentifié'}), 401
        
        # Importer ici pour éviter les imports circulaires
        from models.user import get_user_by_id
        user = get_user_by_id(user_id)
        
        if not user or user.get('role') != 'admin':
            logger.warning(f"Unauthorized access attempt to admin route by user {user_id}")
            return jsonify({'error': 'Accès non autorisé. Réservé aux administrateurs.'}), 403
        
        # Ne pas renommer user_id pour éviter les problèmes de compatibilité
        # Le paramètre user_id est déjà passé par le décorateur login_required
        return f(*args, **kwargs)
    return decorated_function