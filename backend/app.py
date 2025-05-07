from flask import Flask
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.doctors import doctors_bp
from routes.appointments import appointments_bp
from routes.messages import messages_bp
from routes.notifications import notifications_bp
from routes.admin import admin_bp
from utils.errors import handle_error
from utils.logger import setup_logging
import logging

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config.from_object(Config)

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(doctors_bp, url_prefix='/api')
app.register_blueprint(appointments_bp, url_prefix='/api')
app.register_blueprint(messages_bp, url_prefix='/api')
app.register_blueprint(notifications_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')

# Error handling
app.register_error_handler(Exception, handle_error)

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(debug=Config.DEBUG)