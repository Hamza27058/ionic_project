#!/usr/bin/env python
"""
Script pour créer un compte administrateur dans la base de données MediConnect.
Exécuter ce script avec Python pour ajouter un administrateur.
"""

from pymongo import MongoClient
from datetime import datetime
import bcrypt
import os
import sys
from config import Config

# Connexion à la base de données
client = MongoClient(Config.MONGODB_URI)
db = client[Config.DATABASE_NAME]
users_collection = db['users']

def create_admin():
    """Créer un compte administrateur avec des valeurs prédéfinies"""
    
    # Informations de l'administrateur
    name = "Admin"
    surname = "MediConnect"
    email = "admin@mediconnect.com"
    password = "admin123"
    
    # Vérifier si l'email existe déjà
    existing_user = users_collection.find_one({'email': email})
    if existing_user:
        print(f"ERREUR: Un administrateur avec l'email {email} existe déjà.")
        return False
    
    # Hacher le mot de passe
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Créer l'utilisateur avec le rôle admin
    admin = {
        'name': name,
        'surname': surname,
        'email': email,
        'password': hashed_password,
        'role': 'admin',
        'created_at': datetime.now(),
        'favorites': [],
        'photo': ''
    }
    
    result = users_collection.insert_one(admin)
    if result.inserted_id:
        admin_id = str(result.inserted_id)
        print(f"\n=== ADMINISTRATEUR CRÉÉ AVEC SUCCÈS ===\n")
        print(f"ID: {admin_id}")
        print(f"Nom: {name} {surname}")
        print(f"Email: {email}")
        print(f"Mot de passe: {password}")
        print(f"\nUtilisez ces identifiants pour vous connecter à l'interface d'administration.")
        return True
    else:
        print("ERREUR: Impossible de créer l'administrateur.")
        return False

if __name__ == "__main__":
    print("=== Création d'un compte administrateur MediConnect ===")
    create_admin()
