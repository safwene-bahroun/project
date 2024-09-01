from flask import request, jsonify
from .db import get_db

def init_absences_routes_admin(app):
    @app.route('/admin_interface', methods=['GET'])
    def get_absences_etudiant():
        db = get_db()
        try:
            with db.cursor() as cursor:
                query = """
                SELECT a.id, a.etudiant_id, a.emploi_du_temps_id, a.salle_id, a.presence, 
                       a.date_absence, a.carte_rfid, a.cin,
                       e.nom AS etudiant_nom, 
                       e.prenom AS etudiant_prenom,
                       et.periode AS emploi_periode,
                       s.nom AS salle_nom
                FROM absences a
                JOIN etudiant e ON a.etudiant_id = e.id
                JOIN emplois_du_temps et ON a.emploi_du_temps_id = et.id
                JOIN salles s ON a.salle_id = s.id
                """
                cursor.execute(query)
                absences = cursor.fetchall()
                
                absences_list = [
                    {
                        'id': absence[0],
                        'etudiant_id': absence[1],
                        'emploi_du_temps_id': absence[2],
                        'salle_id': absence[3],
                        'presence': absence[4],
                        'date_absence': absence[5],
                        'carte_rfid': absence[6],
                        'cin': absence[7],
                        'etudiant_nom': absence[8],
                        'etudiant_prenom': absence[9],
                        'emploi_periode': absence[10],
                        'salle_nom': absence[11]
                    }
                    for absence in absences
                ]
                
                return jsonify(absences_list)

        except Exception as e:
            print(f"Error fetching absences: {e}")
            return jsonify({'error': 'An error occurred while fetching absences'}), 500
        finally:
            db.close()


    @app.route('/admin_interface/add-card', methods=['POST'])
    def add_card():
        card_data = request.get_json()
        cin = card_data.get('cin')
        rfid_code = card_data.get('rfid_code')

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                "INSERT INTO cards (cin, carte_rfid ) VALUES (%s, %s)",
                (cin, rfid_code)
            )
                conn.commit()
                return jsonify({'message': 'Card added successfully', 'data': card_data}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({'message': 'Error adding card', 'error': str(e)}), 500
        finally:
            conn.close()

    @app.route('/admin_interface/modify-card', methods=['PUT'])
    def modify_card():
        card_data = request.get_json()
        cin = card_data.get('cin')
        rfid_code = card_data.get('rfid_code')

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                "UPDATE cards SET carte_rfid  = %s WHERE cin = %s",
                (rfid_code, cin)
            )
                if cur.rowcount == 0:
                    return jsonify({'message': 'Card not found'}), 404
                conn.commit()
                return jsonify({'message': 'Card modified successfully', 'data': card_data}), 200
        except Exception as e:
            conn.rollback()
            return jsonify({'message': 'Error modifying card', 'error': str(e)}), 500
        finally:
            conn.close()

    @app.route('/admin_interface/delete-card', methods=['DELETE'])
    def delete_card():
        card_data = request.get_json()
        cin = card_data.get('cin')

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                "DELETE FROM cards WHERE cin = %s",
                (cin,)
            )
                if cur.rowcount == 0:
                    return jsonify({'message': 'Card not found'}), 404
                conn.commit()
                return jsonify({'message': 'Card deleted successfully'}), 200
        except Exception as e:
            conn.rollback()
            return jsonify({'message': 'Error deleting card', 'error': str(e)}), 500
        finally:
            conn.close()
