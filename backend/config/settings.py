import os
from dotenv import load_dotenv

def load_config(app):
    load_dotenv()
    app.config['PORT'] = int(os.environ.get('PORT', 5000))
    app.config['DEBUG'] = os.environ.get('FLASK_ENV') == 'development'
    app.config['GROQ_API_KEY'] = os.environ.get('GROQ_API_KEY')
    app.config['FIREBASE_CREDENTIALS_PATH'] = os.environ.get('FIREBASE_CREDENTIALS_PATH')
