from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS
import datetime
from functools import wraps
import jwt
import os
import bcrypt

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.urandom(24)

client = MongoClient('mongodb://localhost:27017/')
db = client['cabinet_medical']
doctors_collection = db['doctors']
appointments_collection = db['appointments']
users_collection = db['users']

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token requis'}), 401
        try:
            token = token.replace('Bearer ', '')
            print(f"Token reçu: {token}")
            data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            print(f"Données décodées: {data}")
            kwargs['user_id'] = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            return jsonify({'error': 'Erreur de décodage', 'details': str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        required_fields = ['name', 'surname', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Champ "{field}" manquant ou vide'}), 400

        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'Cet email existe déjà'}), 400
            
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        user = {
            'name': data['name'],
            'surname': data['surname'],
            'email': data['email'],
            'password': hashed_password,
            'created_at': datetime.datetime.now()
        }
        result = users_collection.insert_one(user)
        
        token = jwt.encode(
            {
                'user_id': str(result.inserted_id),
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            },
            app.secret_key,
            algorithm="HS256"
        )
        
        return jsonify({'token': token, 'user_id': str(result.inserted_id)})
    except Exception as e:
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email ou mot de passe manquant'}), 400
            
        user = users_collection.find_one({'email': data['email']})
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            token = jwt.encode(
                {
                    'user_id': str(user['_id']),
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                },
                app.secret_key,
                algorithm="HS256"
            )
            return jsonify({'token': token, 'user_id': str(user['_id'])})
        return jsonify({'error': 'Identifiants invalides'}), 401
    except Exception as e:
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 400

@app.route('/api/profile', methods=['GET'])
@login_required
def get_profile(user_id):
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
            del user['password']
            return jsonify(user)
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    except Exception as e:
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 500

@app.route('/api/profile', methods=['PUT'])
@login_required
def update_profile(user_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
            
        if 'password' in data and data['password'] != data.get('confirmPassword'):
            return jsonify({'error': 'Les mots de passe ne correspondent pas'}), 400
            
        update_data = {
            'name': data['name'],
            'surname': data['surname'],
            'email': data['email'],
            'updated_at': datetime.datetime.now()
        }
        
        if 'password' in data and data['password']:
            update_data['password'] = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count:
            return jsonify({'message': 'Profil mis à jour'})
        return jsonify({'error': 'Aucune modification effectuée'}), 400
    except Exception as e:
        return jsonify({'error': 'Erreur serveur', 'details': str(e)}), 400

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        doctors = list(doctors_collection.find())
        for doctor in doctors:
            doctor['_id'] = str(doctor['_id'])
        return jsonify(doctors)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctors/<specialty>', methods=['GET'])
def get_doctors_by_specialty(specialty):
    try:
        doctors = list(doctors_collection.find({'specialty': specialty}))
        for doctor in doctors:
            doctor['_id'] = str(doctor['_id'])
        return jsonify(doctors)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    try:
        data = request.json
        appointment = {
            'doctor_id': data['doctor_id'],
            'user_id': data['user_id'],
            'date': data['date'],
            'created_at': datetime.datetime.now()
        }
        result = appointments_collection.insert_one(appointment)
        return jsonify({'message': 'Rendez-vous créé', 'appointment_id': str(result.inserted_id)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/appointments/<user_id>', methods=['GET'])
def get_appointments(user_id):
    try:
        appointments = list(appointments_collection.find({'user_id': user_id}))
        for appointment in appointments:
            appointment['_id'] = str(appointment['_id'])
        return jsonify(appointments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)