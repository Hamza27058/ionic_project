from flask import Blueprint, request, jsonify
from models.message import create_message, get_messages, get_contacts
from models.notification import create_notification
from models.user import get_user_by_id
from utils.auth import login_required
import logging

messages_bp = Blueprint('messages', __name__)
logger = logging.getLogger(__name__)

@messages_bp.route('/contacts/<user_id>', methods=['GET'])
@login_required
def list_contacts(user_id):
    try:
        user = get_user_by_id(user_id)
        if not user:
            raise ValueError('Utilisateur non trouvé')
        contacts = get_contacts(user_id, user['role'])
        logger.info(f"Retrieved contacts for user: {user_id}")
        return jsonify(contacts)
    except ValueError as e:
        logger.error(f"Contacts error: {str(e)}")
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@messages_bp.route('/messages/<sender_id>/<receiver_id>', methods=['GET'])
@login_required
def list_messages(sender_id, receiver_id, user_id):
    try:
        if user_id not in [sender_id, receiver_id]:
            raise ValueError('Accès non autorisé')
        messages = get_messages(sender_id, receiver_id)
        logger.info(f"Retrieved messages between {sender_id} and {receiver_id}")
        return jsonify(messages)
    except ValueError as e:
        logger.error(f"Messages error: {str(e)}")
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@messages_bp.route('/messages', methods=['POST'])
@login_required
def send_new_message(user_id):
    try:
        data = request.json
        if not data:
            raise ValueError('Aucune donnée fournie')
        if data['sender_id'] != user_id:
            raise ValueError('Accès non autorisé')
        message_id = create_message(data)
        
        # Create notification for receiver
        sender = get_user_by_id(data['sender_id'])
        if sender:
            notification_message = f"Nouveau message de {sender['name']} {sender['surname']}"
            create_notification({
                'user_id': data['receiver_id'],
                'message': notification_message
            })
        
        logger.info(f"Message sent: {message_id}")
        return jsonify({'message': 'Message envoyé', 'message_id': message_id})
    except ValueError as e:
        logger.error(f"Message send error: {str(e)}")
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 400