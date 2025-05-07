# Application Médicale - Plateforme de Rendez-vous Médecins

## Description
Cette application est une plateforme médicale complète permettant aux patients de prendre rendez-vous avec des médecins et aux médecins de gérer leur pratique. Développée avec Ionic et Angular, elle offre une expérience utilisateur fluide et intuitive sur mobile et web.

## Fonctionnalités Principales

### Pour les Patients
- Recherche de médecins par spécialité
- Consultation des profils détaillés des médecins
- Prise de rendez-vous en ligne
- Système de notation et avis
- Gestion des favoris
- Messagerie avec les médecins
- Suivi des rendez-vous
- Notifications

### Pour les Médecins
- Tableau de bord personnalisé
- Gestion des rendez-vous
- Profil professionnel détaillé
- Système de messagerie avec les patients
- Gestion des disponibilités
- Statistiques et rapports
- Notifications
### pour admin 
-Ajout des medecins
-Gestion d'utilisateurs
-- Consultation des profils détaillés des médecins et des client

## Technologies Utilisées
- Frontend: Ionic 7, Angular 16
- Backend: Node.js, Express
- Base de données: MongoDB
- Authentication: JWT
- API RESTful

## Prérequis
- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- Ionic CLI
- MongoDB

## Installation

###Cloner le repository
bash
git clone [URL_DU_REPO]
cd [NOM_DU_PROJET]



###Backend :
Setup Instructions
1. Backend Setup
Navigate to the backend directory:
cd backend
Create and activate a virtual environment:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install dependencies:
pip install -r requirements.txt
Run the backend server:
python app.py
The backend typically runs on http://localhost:8000 (adjust port as needed).
###Frontend Setup
Navigate to the frontend directory:
Install dependencies:
npm install
Start the Ionic development server:
ionic serve
The frontend typically runs on http://localhost:8100.
