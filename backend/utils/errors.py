from flask import jsonify
import logging

logger = logging.getLogger(__name__)

def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    return jsonify({'error': 'Erreur serveur', 'details': str(error)}), 500