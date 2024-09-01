from psycopg2 import connect, OperationalError
from flask import g, current_app

def get_db():
    if 'db' not in g:
        g.db = connect(
            host=current_app.config['DB_HOST'],
            database=current_app.config['DB_NAME'],
            user=current_app.config['DB_USER'],
            password=current_app.config['DB_PASSWORD']
        )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    try:
        with db.cursor() as cursor:
            with current_app.open_resource('base.sql') as f:
                cursor.execute(f.read().decode('utf-8'))
            db.commit()
    except OperationalError as e:
        print(f"An error occurred while initializing the database: {e}")
        db.rollback()
    finally:
        db.close()

def init_app(app):
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()
