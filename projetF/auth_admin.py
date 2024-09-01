from flask import request, jsonify, session, g
from werkzeug.security import check_password_hash, generate_password_hash
from .db import get_db

def init_auth_admin_routes(app):
    def load_logged_in_user():
        user_id = session.get('id')
        if user_id is None:
            g.user = None
        else:
            db = get_db()
            try:
                with db.cursor() as cursor:
                    cursor.execute('SELECT * FROM user_admin WHERE id = %s', (user_id,))
                    g.user = cursor.fetchone()
            except Exception as e:
                print(f"An error occurred while loading user: {str(e)}")
                g.user = None
            finally:
               db.close()

    @app.route('/auth_admin/admin_sign', methods=['POST'])
    def register_admin():
        data = request.json
        required_fields = ['admin_name', 'cin', 'email', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]
    
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
        admin_name = data.get('admin_name')
        cin = data.get('cin')
        admin_email = data.get('email')
        password = data.get('password')

        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute(
                'SELECT * FROM user_admin WHERE admin_email = %s', (admin_email,)
            )
                existing_user = cursor.fetchone()
                if existing_user:
                    return jsonify({'error': 'admin with this email already exists.'}), 400
                cursor.execute(
                """
                INSERT INTO user_admin (admin_name, admin_cin, admin_email, admin_password)
                VALUES (%s, %s, %s, %s)
                """,
                (admin_name, cin, admin_email, generate_password_hash(password)),
            )
                db.commit()
                return jsonify({'message': 'admin registered successfully'}), 201
    
        except Exception as e:
            db.rollback()
            print(f"An error occurred during registration: {str(e)}")
            return jsonify({'error': 'An error occurred during registration.'}), 500
    
        finally:
            db.close()


    @app.route('/auth_admin/admin_login', methods=['POST'])
    def login_admin():
        data = request.json
        admin_name = data.get('user')
        password = data.get('password')
    
        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute(
                'SELECT * FROM user_admin WHERE admin_name = %s', (admin_name,)
            )
                user = cursor.fetchone()
                if user is None:
                    return jsonify({'error': 'Incorrect user.'}), 400
                elif not check_password_hash(user[4], password):
                   return jsonify({'error': 'Incorrect password.'}), 400

                session.clear()
                session['id'] = user[0]
                return jsonify({'message': 'Login successful'}), 200
        except Exception as e:
            print(f"An error occurred during login: {str(e)}")
            return jsonify({'error': 'An error occurred during login.'}), 500
        finally:
            db.close()

    @app.route('/admin_interface/admin_logout', methods=['POST'])
    def logout_admin():
        session.clear()
        return jsonify({'message': 'Logged out successfully'}), 200
