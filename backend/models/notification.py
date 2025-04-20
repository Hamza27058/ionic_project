from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from config import Config

client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
notifications_collection = db['notifications']
users_collection = db['users']
doctors_collection = db['doctors']

def validate_notification_data(data):
    required_fields = ['user_id', 'message']
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f'Champ "{field}" manquant ou vide')

def create_notification(notification_data):
    validate_notification_data(notification_data)
    notification = {
        'user_id': notification_data['user_id'],
        'message': notification_data['message'],
        'created_at': datetime.now(),
        'read': False
    }
    result = notifications_collection.insert_one(notification)
    return str(result.inserted_id)

def get_notifications(user_id):
    notifications = list(notifications_collection.find({'user_id': user_id}).sort('created_at', -1))
    result = []
    for notification in notifications:
        notification_data = {
            'id': str(notification['_id']),
            'user_id': notification['user_id'],
            'message': notification['message'],
            'created_at': notification['created_at'].isoformat(),
            'read': notification['read']
        }
        result.append(notification_data)
    return result