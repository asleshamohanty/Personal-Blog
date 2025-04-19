from flask import Blueprint, request, jsonify, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from oauthlib.oauth2 import WebApplicationClient
import requests
from extensions import db
from models import User
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Google OAuth client
client_id = os.getenv('GOOGLE_CLIENT_ID')
client = WebApplicationClient(client_id) if client_id else None

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        login_user(user)
        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    
    return jsonify({'error': 'Invalid username or password'}), 401

@bp.route('/google/login')
def google_login():
    if not client or not client_id:
        return jsonify({'error': 'Google OAuth is not configured'}), 500
        
    # Find out what URL to hit for Google login
    try:
        google_provider_cfg = requests.get(os.getenv('GOOGLE_DISCOVERY_URL')).json()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]

        # Use library to construct the request for login and provide
        # scopes that let you retrieve user's profile from Google
        request_uri = client.prepare_request_uri(
            authorization_endpoint,
            redirect_uri=request.base_url + "/callback",
            scope=["openid", "email", "profile"],
        )
        return redirect(request_uri)
    except Exception as e:
        return jsonify({'error': f'Error configuring Google OAuth: {str(e)}'}), 500

@bp.route('/google/login/callback')
def google_callback():
    if not client or not client_id:
        return jsonify({'error': 'Google OAuth is not configured'}), 500
        
    # Get authorization code Google sent back
    code = request.args.get("code")
    
    try:
        # Find out what URL to hit to get tokens
        google_provider_cfg = requests.get(os.getenv('GOOGLE_DISCOVERY_URL')).json()
        token_endpoint = google_provider_cfg["token_endpoint"]

        # Prepare and send request to get tokens
        token_url, headers, body = client.prepare_token_request(
            token_endpoint,
            authorization_response=request.url,
            redirect_url=request.base_url,
            code=code
        )
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(os.getenv('GOOGLE_CLIENT_ID'), os.getenv('GOOGLE_CLIENT_SECRET')),
        )

        # Parse the tokens
        client.parse_request_body_response(token_response.text)
        
        # Get user info from Google
        userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
        uri, headers, body = client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)

        if userinfo_response.json().get("email_verified"):
            google_id = userinfo_response.json()["sub"]
            email = userinfo_response.json()["email"]
            name = userinfo_response.json()["name"]
            picture = userinfo_response.json().get("picture")
            
            # Check if user exists
            user = User.query.filter_by(google_id=google_id).first()
            
            if not user:
                # Create new user
                user = User(
                    google_id=google_id,
                    email=email,
                    name=name,
                    profile_picture=picture
                )
                db.session.add(user)
                db.session.commit()
            
            # Log in the user
            login_user(user)
            
            # Redirect to frontend with success message
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            return redirect(f"{frontend_url}?login=success")
        else:
            return "User email not available or not verified by Google.", 400
    except Exception as e:
        return jsonify({'error': f'Error during Google OAuth callback: {str(e)}'}), 500

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(os.getenv('FRONTEND_URL', 'http://localhost:5173'))

@bp.route('/me')
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'name': current_user.name or current_user.email.split('@')[0],
        'profile_picture': current_user.profile_picture
    }) 