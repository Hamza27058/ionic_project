from flask import Flask
from flask_cors import CORS
from flask_cors import CORS
from routes.patient_routes import patient_routes
from routes.medecin_routes import medecin_routes
from routes.rendezvous_routes import rendezvous_routes
from routes.admin_routes import admin_routes

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Enregistrer les routes
app.register_blueprint(patient_routes)
app.register_blueprint(medecin_routes)
app.register_blueprint(rendezvous_routes)
app.register_blueprint(admin_routes)

if __name__ == "__main__":
    app.run(debug=True)
