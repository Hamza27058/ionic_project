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
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        
        return f(user_id, *args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(user_id, *args, **kwargs):
        from models.admin import is_admin
        
        if not is_admin(user_id):
            return jsonify({'error': 'Accès non autorisé. Privilèges administrateur requis.'}), 403
        
        return f(user_id, *args, **kwargs)
    return decorated_function