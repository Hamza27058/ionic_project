from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import bcrypt
import sys
from config import Config

# Connexion à la base de données
client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
users_collection = db['users']

def add_admin(admin_data):
    # Vérifier si l'email existe déjà
    existing_user = users_collection.find_one({'email': admin_data['email']})
    if existing_user:
        print(f"Un utilisateur avec l'email {admin_data['email']} existe déjà.")
        
        # Si l'utilisateur existe déjà, vérifier s'il est déjà admin
        if existing_user.get('role') == 'admin':
            print("Cet utilisateur est déjà un administrateur.")
            return False
        
        # Sinon, mettre à jour son rôle pour le rendre admin
        users_collection.update_one(
            {'_id': existing_user['_id']},
            {'$set': {'role': 'admin'}}
        )
        print(f"L'utilisateur {admin_data['email']} a été promu administrateur.")
        return True
    
    # Hacher le mot de passe
    hashed_password = bcrypt.hashpw(admin_data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Créer l'administrateur
    admin = {
        'name': admin_data['name'],
        'surname': admin_data['surname'],
        'email': admin_data['email'],
        'password': hashed_password,
        'role': 'admin',  # Rôle administrateur
        'created_at': datetime.now(),
        'photo': '',
        'favorites': []  # Champ requis
    }
    
    # Insérer dans la base de données
    result = users_collection.insert_one(admin)
    print(f"Administrateur ajouté avec succès! ID: {result.inserted_id}")
    return True

def print_usage():
    print("\nUtilisation:")
    print("python add_admin.py [email] [password] [name] [surname]")
    print("\nExemple:")
    print("python add_admin.py admin@example.com admin123 Admin System")
    print("\nOu exécutez le script sans arguments pour utiliser les valeurs par défaut.")

if __name__ == "__main__":
    # Valeurs par défaut
    admin_data = {
        'name': 'Admin',
        'surname': 'System',
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    # Si des arguments sont fournis, les utiliser
    if len(sys.argv) > 1:
        if len(sys.argv) < 5:
            print("Erreur: Nombre d'arguments insuffisant.")
            print_usage()
            sys.exit(1)
        
        admin_data = {
            'email': sys.argv[1],
            'password': sys.argv[2],
            'name': sys.argv[3],
            'surname': sys.argv[4]
        }
    
    # Afficher les informations qui vont être utilisées
    print("\nAjout d'un administrateur avec les informations suivantes:")
    print(f"Email: {admin_data['email']}")
    print(f"Nom: {admin_data['name']}")
    print(f"Prénom: {admin_data['surname']}")
    print(f"Mot de passe: {'*' * len(admin_data['password'])}")
    
    # Demander confirmation
    confirm = input("\nConfirmez-vous l'ajout de cet administrateur? (o/n): ")
    if confirm.lower() not in ['o', 'oui', 'y', 'yes']:
        print("Opération annulée.")
        sys.exit(0)
    
    # Ajouter l'administrateur
    add_admin(admin_data)
