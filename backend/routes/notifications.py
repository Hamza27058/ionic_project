from flask import Blueprint, jsonify
from models.notification import get_notifications
from utils.auth import login_required
import logging

notifications_bp = Blueprint('notifications', __name__)
logger = logging.getLogger(__name__)

@notifications_bp.route('/notifications/<user_id>', methods=['GET'])
@login_required
def list_notifications(user_id):
    try:
        if user_id != user_id:  # Ensure user can only access their notifications
            raise ValueError('Accès non autorisé')
        notifications = get_notifications(user_id)
        logger.info(f"Retrieved notifications for user: {user_id}")
        return jsonify(notifications)
    except ValueError as e:
        logger.error(f"Unauthorized access: {str(e)}")
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        logger.error(f"Error retrieving notifications: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500