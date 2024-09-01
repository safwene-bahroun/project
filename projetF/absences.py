from flask import request, jsonify, g
from .db import get_db
from datetime import time as dt_time
from datetime import datetime
from functools import wraps
from flask_jwt_extended import  jwt_required,get_jwt_identity
def init_absences_routes(app):
    @app.route('/absences/rfid', methods=['POST'])
    def handle_rfid():
        data = request.json
        if 'uid' not in data or 'timestamp' not in data or 'salle_name' not in data:
            return jsonify({"status": "fail", "message": "Invalid data"}), 400

        uid = data['uid']
        try:
            timestamp = datetime.fromisoformat(data['timestamp'])
        except ValueError:
            return jsonify({"status": "fail", "message": "Invalid timestamp format"}), 400

        salle_name = data.get('salle_name', 'Unknown')

        try:
            db = get_db()
            cur = db.cursor()

            insert_query = """
                INSERT INTO ouvertures_porte (carte_rfid, date_ouverture, salle_id)
                VALUES (%s, %s, (SELECT id FROM salles WHERE nom = %s))
            """
            cur.execute(insert_query, (uid, timestamp, salle_name))
            db.commit()

            return jsonify({"status": "success"}), 201

        except Exception as e:
            db.rollback()
            return jsonify({"status": "error", "message": str(e)}), 500

        finally:
            cur.close()
            db.close()


#khatih ili fouk mrigl adhaka

    @app.route('/absences', methods=['GET'])
    @jwt_required()
    def get_absences():
        cin = request.args.get('cin')
        carte_rfid = request.args.get('carte_rfid')
        if not cin:
            return jsonify({'error': 'CIN is required'}), 400
        if not carte_rfid:
            return jsonify({'error': 'RFID card is required'}), 400

    # Get the CIN from the JWT token
        token_cin = get_jwt_identity().get('cin')

        if cin != token_cin:
            return jsonify({'error': 'Unauthorized access'}), 403

        db = get_db()
        try:
            with db.cursor() as cur:
                first_open_periods = [
                (dt_time(8, 30), dt_time(8, 40)),
                (dt_time(10, 0), dt_time(10, 10)),
                (dt_time(11, 30), dt_time(11, 40)),
                (dt_time(14, 0), dt_time(14, 10)),
            ]
                second_open_periods = [
                (dt_time(10, 0), dt_time(10, 5)),
                (dt_time(11, 30), dt_time(11, 35)),
                (dt_time(13, 10), dt_time(13, 15)),
                (dt_time(15, 30), dt_time(15, 35)),
            ]

            # Get absences for the student
                cur.execute('''
                SELECT e.nom AS Nom_Etudiant, e.prenom AS Prenom_Etudiant, e.cin AS CIN,
                       ed.periode AS Periode, ed.matiere AS Matiere, s.nom AS Salle,
                       a.presence AS Presence, a.date_absence AS Date_Absence
                FROM etudiant e
                JOIN absences a ON e.id = a.etudiant_id
                JOIN emplois_du_temps ed ON a.emploi_du_temps_id = ed.id
                JOIN salles s ON a.salle_id = s.id
                WHERE e.cin = %s
            ''', (cin,))
                absences = cur.fetchall()

            # Get open periods based on RFID detection
                cur.execute('''
                SELECT date_ouverture
                FROM ouvertures_porte
                WHERE carte_rfid = (
                    SELECT carte_rfid
                    FROM etudiant
                    WHERE cin = %s
                )
            ''', (cin,))
                ouvertures = cur.fetchall()

            # Process each opening time
                for ouverture in ouvertures:
                    date_ouverture = ouverture[0].time()
                    presence_status = "absent"

                # Check if detected time falls in first open periods
                    for start_time, end_time in first_open_periods:
                        if start_time <= date_ouverture <= end_time:
                            presence_status = "being processed ..."
                            break

                # Update the presence status if detected in second open periods
                    if presence_status == "being processed ...":
                        for start_time, end_time in second_open_periods:
                            if start_time <= date_ouverture <= end_time:
                                presence_status = "present"
                                break

                # Insert or update the absence record
                    cur.execute('''
                    INSERT INTO absences (etudiant_id, emploi_du_temps_id, salle_id, presence, date_absence, carte_rfid, cin)
                    SELECT e.id, ed.id, s.id, %s, NOW(), %s, e.cin
                    FROM etudiant e
                    JOIN emplois_du_temps ed ON e.classes = ed.classe_id
                    JOIN salles s ON ed.salles_id = s.id
                    WHERE e.cin = %s
                    ON CONFLICT (etudiant_id, emploi_du_temps_id, salle_id, date_absence) 
                    DO UPDATE SET presence = EXCLUDED.presence
                ''', (presence_status, carte_rfid, cin))

                db.commit()
                return jsonify({'message': 'Absences processed'}), 200

        except Exception as e:
            print(f"An error occurred: {str(e)}")
            db.rollback()
            return jsonify({'error': 'An error occurred during processing.'}), 500

        finally:
            db.close()


    @app.route('/absences/<int:id>', methods=['GET'])
    @jwt_required()
    def get_student_emploi(id):
        current_user = get_jwt_identity()
        cin = request.args.get('cin')
        if not cin:
            return jsonify({'error': 'CIN is required'}), 400

        try:
            db = get_db()
            cur = db.cursor()

        # Fetch the student's schedule
            cur.execute('''
            SELECT ed.periode AS Periode, ed.matiere AS Matiere, s.nom AS Salle
            FROM emplois_du_temps ed
            JOIN salles s ON ed.salles_id = s.id
            JOIN etudiant e ON e.classes = ed.classe_id
            WHERE e.cin = %s
        ''', (cin,))
            emplois = cur.fetchall()

        # Fetch the student's absences
            cur.execute('''
            SELECT ed.periode AS Periode, ed.matiere AS Matiere, a.presence AS Presence
            FROM absences a
            JOIN emplois_du_temps ed ON a.emploi_du_temps_id = ed.id
            JOIN etudiant e ON a.etudiant_id = e.id
            WHERE e.cin = %s
        ''', (cin,))
            absences = cur.fetchall()

        # Combine data
            emploi_dict = {}
            for emploi in emplois:
                periode = emploi[0]
                matiere = emploi[1]
                emploi_dict[(periode, matiere)] = {'salle': emploi[2], 'presence': 'present'}

            for absence in absences:
                periode = absence[0]
                matiere = absence[1]
                if (periode, matiere) in emploi_dict:
                    emploi_dict[(periode, matiere)]['presence'] = absence[2]

            response = {
            'emplois': [{'Periode': key[0], 'Matiere': key[1], 'Salle': value['salle'], 'Presence': value['presence']} for key, value in emploi_dict.items()]
        }

            return jsonify(response), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

        finally:
            cur.close()
            db.close()


    @app.route('/absences/profile/<int:id>', methods=['GET'])
    @jwt_required()
    def get_profile(id):
        current_user = get_jwt_identity()
        db = get_db()
        cur = db.cursor()
        try:
            cur.execute('SELECT * FROM etudiant WHERE id = %s', (id,))
            etudiant = cur.fetchone()
            if etudiant is None:
                return jsonify({'error': 'Student not found'}), 404

            return jsonify({
            'id':etudiant['id'],
            'nom': etudiant['nom'],
            'prenom': etudiant['prenom'],
            'cin': etudiant['cin'],
            'carte_rfid': etudiant['carte_rfid'],
            'email': etudiant['email'],
            'classes': etudiant['classes'],
            'fields': etudiant['fields'],
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cur.close()
