from flask import Flask
import os
from dotenv import load_dotenv
from extensions import init_extensions

load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///blog.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')
app.config['GOOGLE_DISCOVERY_URL'] = "https://accounts.google.com/.well-known/openid-configuration"

init_extensions(app)

from routes import auth_routes, blog_routes

app.register_blueprint(auth_routes.bp)
app.register_blueprint(blog_routes.bp)

if __name__ == '__main__':
    with app.app_context():
        from extensions import db
        db.create_all()
    app.run(debug=True) 