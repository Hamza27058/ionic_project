from flask import Blueprint, request, jsonify
from models.appointment import create_appointment, get_appointments, get_doctor_appointments, update_appointment, appointments_collection
from models.notification import create_notification
from models.user import get_user_by_id
from models.doctor import get_doctors
from utils.auth import login_required
import logging
from bson import ObjectId

appointments_bp = Blueprint('appointments', __name__)
logger = logging.getLogger(__name__)

@appointments_bp.route('/appointments', methods=['POST'])
def create_new_appointment():
    try:
        data = request.json
        if not data:
            raise ValueError('Aucune donnée fournie')
        appointment_id = create_appointment(data)
        
        # Create notification for user
        user = get_user_by_id(data['user_id'])
        doctor = next((d for d in get_doctors() if d['_id'] == data['doctor_id']), None)
        if user and doctor:
            notification_message = f"Nouveau rendez-vous avec {doctor['name']} {doctor['surname']} le {data['date']}"
            create_notification({
                'user_id': data['user_id'],
                'message': notification_message
            })
        
        logger.info(f"Appointment created: {appointment_id}")
        return jsonify({'message': 'Rendez-vous créé', 'appointment_id': appointment_id})
    except ValueError as e:
        logger.error(f"Error creating appointment: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@appointments_bp.route('/appointments/<user_id>', methods=['GET'])
def list_appointments(user_id):
    try:
        appointments = get_appointments(user_id)
        logger.info(f"Retrieved appointments for user: {user_id}")
        return jsonify(appointments)
    except ValueError as e:
        logger.error(f"Error retrieving appointments: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error retrieving appointments: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@appointments_bp.route('/doctor-appointments/<doctor_id>', methods=['GET'])
@login_required
def list_doctor_appointments(doctor_id, user_id):
    try:
        if user_id != doctor_id:
            raise ValueError('Accès non autorisé')
        appointments = get_doctor_appointments(doctor_id)
        logger.info(f"Retrieved doctor appointments: {doctor_id}")
        return jsonify(appointments)
    except ValueError as e:
        logger.error(f"Unauthorized access: {str(e)}")
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        logger.error(f"Error retrieving doctor appointments: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@appointments_bp.route('/appointments/<appointment_id>', methods=['PUT'])
@login_required
def update_appointment_status(appointment_id, user_id):
    try:
        data = request.json
        if not data:
            raise ValueError('Aucune donnée fournie')
        if update_appointment(appointment_id, data, user_id):
            # Create notification for user
            appointment = appointments_collection.find_one({'_id': ObjectId(appointment_id)})
            if appointment:
                user = get_user_by_id(appointment['user_id'])
                doctor = next((d for d in get_doctors() if d['_id'] == appointment['doctor_id']), None)
                if user and doctor:
                    status_message = 'accepté' if data['status'] == 'accepted' else 'refusé'
                    notification_message = f"Votre rendez-vous avec {doctor['name']} {doctor['surname']} a été {status_message}"
                    create_notification({
                        'user_id': appointment['user_id'],
                        'message': notification_message
                    })
                    
                    # Si le rendez-vous est accepté, créer un message initial pour faciliter la communication
                    if data['status'] == 'accepted':
                        from models.message import create_message
                        
                        # Message du médecin au patient
                        initial_message = {
                            'sender_id': appointment['doctor_id'],
                            'receiver_id': appointment['user_id'],
                            'content': f"Bonjour, j'ai accepté votre rendez-vous pour le {appointment['date']}. N'hésitez pas à me contacter si vous avez des questions."
                        }
                        create_message(initial_message)
                        
                        # Notification pour informer le patient qu'il peut maintenant contacter le médecin
                        contact_notification = {
                            'user_id': appointment['user_id'],
                            'message': f"Vous pouvez maintenant contacter Dr. {doctor['name']} {doctor['surname']} via la messagerie."
                        }
                        create_notification(contact_notification)
            
            logger.info(f"Appointment updated: {appointment_id}")
            return jsonify({'message': 'Rendez-vous mis à jour'})
        raise ValueError('Aucune modification effectuée')
    except ValueError as e:
        logger.error(f"Appointment update error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500