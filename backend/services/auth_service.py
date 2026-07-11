import uuid
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
from services.db_service import db_service
import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-secret-key-for-dev')

class AuthService:
    def signup(self, name, email, password):
        # Check if user exists
        if db_service.get_user_by_email(email):
            raise ValueError("Email already exists")
            
        uid = str(uuid.uuid4())
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        now = datetime.now(timezone.utc).isoformat()
        user_data = {
            "uid": uid,
            "name": name,
            "email": email,
            "passwordHash": hashed_password,
            "role": "STUDENT",
            "accountStatus": "ACTIVE",
            "emailVerified": False,
            "createdAt": now,
            "updatedAt": now,
            "lastLogin": None,
            "preferences": {}
        }
        
        db_service.create_user(uid, user_data)
        
        # Generate token
        token = self._generate_token(uid)
        return token, self._safe_user(user_data)

    def login(self, email, password):
        user = db_service.get_user_by_email(email)
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.get('passwordHash', '').encode('utf-8')):
            raise ValueError("Invalid credentials")
            
        # Update last login
        db_service.update_user(user['uid'], {"lastLogin": datetime.now(timezone.utc).isoformat()})
        
        token = self._generate_token(user['uid'])
        return token, self._safe_user(user)

    def verify_token(self, token):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            uid = payload.get('uid')
            user = db_service.get_user_by_id(uid)
            if not user:
                raise ValueError("User not found")
            return self._safe_user(user)
        except jwt.ExpiredSignatureError:
            raise ValueError("Token expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")

    def _generate_token(self, uid):
        payload = {
            'uid': uid,
            'exp': datetime.now(timezone.utc) + timedelta(days=1),
            'iat': datetime.now(timezone.utc)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    def _safe_user(self, user_data):
        safe_data = user_data.copy()
        safe_data.pop('passwordHash', None)
        return safe_data

auth_service = AuthService()
