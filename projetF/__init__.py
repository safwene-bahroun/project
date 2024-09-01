from flask import Flask
from flask_cors import CORS
import os
import secrets
from .db import init_app
from flask_jwt_extended import JWTManager
def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_mapping(
        DB_HOST=os.getenv('DB_HOST', 'localhost'),
        DB_NAME=os.getenv('DB_NAME', 'safwene'),
        DB_USER=os.getenv('DB_USER', 'saf'),
        DB_PASSWORD=os.getenv('DB_PASSWORD', 'safwene'),
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', secrets.token_hex(16))
    )
    jwt = JWTManager(app)
    init_app(app)
    from .auth import init_auth_routes
    from .absences import init_absences_routes
    from. auth_admin import  init_auth_admin_routes
    from. config_admin import init_absences_routes_admin
    init_auth_admin_routes(app)
    init_auth_routes(app)
    init_absences_routes(app)
    init_absences_routes_admin(app)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
