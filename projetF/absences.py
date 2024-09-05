from flask import request, jsonify, g
from .db import get_db
from datetime import time as dt_time
from datetime import datetime
from flask_jwt_extended import  jwt_required,get_jwt_identity
def init_absences_routes(app):
    @app.route('/absences/rfid', methods=['POST'])
    def handle_rfid_and_process_absences():
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

        # Insert only RFID data into the cards table
            insert_card_query = """
            INSERT INTO cards (carte_rfid) VALUES (%s)
            ON CONFLICT (carte_rfid) DO NOTHING
        """
            cur.execute(insert_card_query, (uid,))
            db.commit()

        # Get the salle_id from salle_name
            cur.execute("SELECT id FROM salles WHERE nom = %s", (salle_name,))
            salle_result = cur.fetchone()
            if salle_result is None:
                return jsonify({"status": "fail", "message": "Invalid salle name"}), 400
            salle_id = salle_result[0]

        # Retrieve the cin associated with the carte_rfid (uid)
            cur.execute("SELECT cin FROM etudiant WHERE carte_rfid = %s", (uid,))
            student_result = cur.fetchone()
            if student_result is None:
                return jsonify({"status": "fail", "message": "RFID card not associated with any student"}), 400
            cin = student_result[0]

        # Insert RFID data into the ouvertures_porte table
            insert_opening_query = """
            INSERT INTO ouvertures_porte (carte_rfid, date_ouverture, salle_id, cin)
            VALUES (%s, %s, %s, %s)
        """
            cur.execute(insert_opening_query, (uid, timestamp, salle_id, cin))
            db.commit()

        # Define open periods for attendance processing
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

        # Process absences for the detected RFID card
            cur.execute('''
            SELECT date_ouverture
            FROM ouvertures_porte
            WHERE carte_rfid = %s
            AND cin = %s
        ''', (uid, cin))
            ouvertures = cur.fetchall()

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
            ''', (presence_status, uid, cin))

            db.commit()
            return jsonify({"status": "success", "message": "RFID data and absences processed"}), 201

        except Exception as e:
            db.rollback()
            return jsonify({"status": "error", "message": str(e)}), 500

        finally:
            cur.close()
            db.close()




    @app.route('/auth/absences/<int:id>', methods=['GET'])
    @jwt_required()
    def get_student_emploi(id):
        current_user_id = get_jwt_identity()['id']
        if current_user_id != id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        db = get_db()
        cur = db.cursor()
        try:
            cur.execute('SELECT * FROM etudiant WHERE id = %s', (id,))
            user = cur.fetchone()

            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            cin = user[3]  # Adjust if 'cin' is not the 4th column

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

    @app.route('/auth/profile/<int:id>', methods=['GET'])
    @jwt_required()
    def get_profile(id):
        current_user_id = get_jwt_identity()
        if current_user_id['id'] != id:
            return jsonify({'error': 'Unauthorized access'}), 403

        db = get_db()
        cur = db.cursor()
        try:
            cur.execute('SELECT * FROM etudiant WHERE id = %s', (id,))
            etudiant = cur.fetchone()
            if etudiant is None:
                return jsonify({'error': 'Student not found'}), 404

            return jsonify({
                'id': etudiant[0],
                'nom': etudiant[1],
                'prenom': etudiant[2],
                'cin': etudiant[3],
                'carte_rfid': etudiant[8],
                'email': etudiant[4],
                'classes': etudiant[5],
                'fields': etudiant[6]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cur.close()
            db.close()