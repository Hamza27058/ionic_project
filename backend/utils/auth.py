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