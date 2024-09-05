from flask import request, jsonify, g
from werkzeug.security import check_password_hash, generate_password_hash
from .db import get_db
from flask_jwt_extended import (
    create_access_token, 
    jwt_required,
    unset_jwt_cookies,
    get_jwt_identity,
    JWTManager,
)

def load_logged_in_user():
    user_id = get_jwt_identity()
    if user_id is None:
        g.user = None
    else:
        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute('SELECT * FROM etudiant WHERE id = %s', (user_id['id'],))
                g.user = cursor.fetchone()
        except Exception as e:
            print(f"An error occurred while loading user: {str(e)}")
            g.user = None
        finally:
            db.close()

def init_auth_routes(app):
    @app.before_request
    def before_request():
        if request.endpoint in ['register', 'login', 'logout']:
            return
        jwt_required()(load_logged_in_user)

    @app.route('/auth/register', methods=['POST'])
    def register():
        data = request.json
        required_fields = ['nom', 'prenom', 'cin', 'email', 'classes', 'fields', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        nom = data.get('nom')
        prenom = data.get('prenom')
        cin = data.get('cin')
        email = data.get('email')
        classes = data.get('classes')
        fields = data.get('fields')
        password = data.get('password')

        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute('SELECT * FROM etudiant WHERE email = %s', (email,))
                existing_user = cursor.fetchone()
                if existing_user:
                    return jsonify({'error': 'User with this email already exists.'}), 400

                cursor.execute("SELECT id FROM classes WHERE nom = %s", (classes,))
                classes_id = cursor.fetchone()[0]

                cursor.execute("SELECT id FROM fields WHERE nom = %s", (fields,))
                fields_id = cursor.fetchone()[0]

                cursor.execute("""
                INSERT INTO etudiant (nom, prenom, cin, email, classes, fields, password)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (nom, prenom, cin, email, classes_id, fields_id, generate_password_hash(password))
            )
            db.commit()
            return jsonify({'message': 'User registered successfully'}), 201
        
        except Exception as e:
            db.rollback()
            print(f"An error occurred during registration: {str(e)}")
            return jsonify({'error': 'An error occurred during registration.'}), 500
        
        finally:
            db.close()

    @app.route('/auth/login', methods=['POST'])
    def login():
        data = request.json
        email = data.get('email')
        password = data.get('password')

        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute('SELECT * FROM etudiant WHERE email = %s', (email,))
                user = cursor.fetchone()

                if user is None:
                    return jsonify({'error': 'Incorrect email.'}), 400
                elif not check_password_hash(user[7], password):
                    return jsonify({'error': 'Incorrect password.'}), 400
                access_token = create_access_token(identity={'id': user[0]})
                return jsonify({'token': access_token} ), 200
        
        except Exception as e:
            print(f"An error occurred during login: {str(e)}")
            return jsonify({'error': 'An error occurred during login.'}), 500
        finally:
            db.close()

    @app.route('/auth/logout', methods=['POST'])
    @jwt_required()
    def logout():
        try:
            response = jsonify({'msg': 'Logout successful'})
            unset_jwt_cookies(response)
            return response, 200
        except Exception as e:
            print(f"An error occurred during logout: {str(e)}")
            return jsonify({'error': 'An error occurred during logout.'}), 500