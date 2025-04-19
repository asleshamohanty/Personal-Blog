from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_login import login_required, current_user
from extensions import db
from models import Post, Comment, User
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

bp = Blueprint('blog', __name__, url_prefix='/api/blog')

@bp.route('/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'posts': [{
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'created_at': post.created_at.isoformat(),
            'img_url': post.img_url,
            'is_public': post.is_public,
            'author': {
                'id': post.author.id,
                'name': post.author.name,
                'profile_picture': post.author.profile_picture
            }
        } for post in posts.items],
        'total': posts.total,
        'pages': posts.pages,
        'current_page': posts.page
    })

@bp.route('/posts', methods=['POST'])
@login_required
def create_post():
    try:
        if not current_user.is_authenticated:
            return jsonify({"error": "User not authenticated"}), 401

        if request.is_json:
            data = request.get_json()
            title = data.get('title')
            content = data.get('content')
            img_url = None
        else:
            title = request.form.get('title')
            content = request.form.get('content')
            image = request.files.get('image')
            img_url = None
            
            if image:
                try:
                    # Create uploads directory if it doesn't exist
                    upload_dir = os.path.join(current_app.root_path, 'uploads')
                    os.makedirs(upload_dir, exist_ok=True)
                    
                    # Save the file
                    filename = secure_filename(image.filename)
                    # Add timestamp to filename to make it unique
                    filename = f"{int(datetime.utcnow().timestamp())}_{filename}"
                    image_path = os.path.join(upload_dir, filename)
                    image.save(image_path)
                    
                    # Set the image URL with the full path
                    img_url = f"/api/blog/uploads/{filename}"
                except Exception as e:
                    current_app.logger.error(f"Error saving image: {str(e)}")
                    return jsonify({"error": "Failed to save image"}), 500

        # For photo posts, only require content if there's no image
        if img_url and not content:
            content = ""  # Make content optional for photo posts
        elif not content and not img_url:
            return jsonify({"error": "Content is required for blog posts"}), 400

        # For blog posts, require both title and content
        if not img_url and (not title or not content):
            return jsonify({"error": "Title and content are required for blog posts"}), 400

        try:
            # Log the data we're about to use to create the post
            current_app.logger.info(f"Creating post with data: title={title}, content={content}, user_id={current_user.id}, img_url={img_url}, type={'photo' if img_url else 'blog'}")
            
            new_post = Post(
                title=title,
                content=content,
                user_id=current_user.id,
                img_url=img_url,
                is_public=True,
                type='photo' if img_url else 'blog'
            )
            
            # Log the post object before adding to session
            current_app.logger.info(f"Post object created: {new_post}")
            
            db.session.add(new_post)
            db.session.commit()

            return jsonify({
                "message": "Post created successfully",
                "post": {
                    "id": new_post.id,
                    "title": new_post.title,
                    "content": new_post.content,
                    "created_at": new_post.created_at.isoformat(),
                    "img_url": new_post.img_url,
                    "is_public": new_post.is_public,
                    "type": new_post.type
                }
            }), 201
        except Exception as e:
            current_app.logger.error(f"Database error creating post: {str(e)}")
            current_app.logger.error(f"Error type: {type(e)}")
            current_app.logger.error(f"Error args: {e.args}")
            db.session.rollback()
            return jsonify({"error": f"Database error creating post: {str(e)}"}), 500
    except Exception as e:
        current_app.logger.error(f"Error creating post: {str(e)}")
        return jsonify({"error": "Failed to create post"}), 500

@bp.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded files."""
    return send_from_directory(os.path.join(current_app.root_path, 'uploads'), filename)

@bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'created_at': post.created_at.isoformat(),
        'author': {
            'id': post.author.id,
            'name': post.author.name,
            'profile_picture': post.author.profile_picture
        },
        'comments': [{
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'author': {
                'id': comment.author.id,
                'name': comment.author.name,
                'profile_picture': comment.author.profile_picture
            }
        } for comment in post.comments]
    })

@bp.route('/posts/<int:post_id>', methods=['PUT'])
@login_required
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if request.is_json:
        data = request.get_json()
        post.title = data.get('title', post.title)
        post.content = data.get('content', post.content)
    else:
        post.title = request.form.get('title', post.title)
        post.content = request.form.get('content', post.content)
        image = request.files.get('image')
        
        if image:
            # Create uploads directory if it doesn't exist
            upload_dir = os.path.join(current_app.root_path, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save the file
            filename = secure_filename(image.filename)
            # Add timestamp to filename to make it unique
            filename = f"{int(datetime.utcnow().timestamp())}_{filename}"
            image_path = os.path.join(upload_dir, filename)
            image.save(image_path)
            
            # Update the image URL
            post.img_url = f"/api/blog/uploads/{filename}"
    
    db.session.commit()
    
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'img_url': post.img_url,
        'created_at': post.created_at.isoformat(),
        'updated_at': post.updated_at.isoformat()
    })

@bp.route('/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({'message': 'Post deleted successfully'})

@bp.route('/posts/<int:post_id>/visibility', methods=['PUT'])
@login_required
def update_post_visibility(post_id):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    if 'is_public' not in data:
        return jsonify({'error': 'is_public field is required'}), 400
    
    post.is_public = data['is_public']
    db.session.commit()
    
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'img_url': post.img_url,
        'created_at': post.created_at.isoformat(),
        'is_public': post.is_public,
        'type': post.type
    })

@bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@login_required
def create_comment(post_id):
    data = request.get_json()
    
    comment = Comment(
        content=data['content'],
        user_id=current_user.id,
        post_id=post_id
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'created_at': comment.created_at.isoformat(),
        'author': {
            'id': comment.author.id,
            'name': comment.author.name,
            'profile_picture': comment.author.profile_picture
        }
    }), 201

@bp.route('/user/posts', methods=['GET'])
@login_required
def get_user_posts():
    posts = Post.query.filter_by(user_id=current_user.id).order_by(Post.created_at.desc()).all()
    
    return jsonify({
        'posts': [{
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'created_at': post.created_at.isoformat(),
            'img_url': post.img_url,
            'is_public': post.is_public,
            'author': {
                'id': post.author.id,
                'name': post.author.name,
                'profile_picture': post.author.profile_picture
            }
        } for post in posts]
    })

@bp.route('/contact', methods=['POST'])
def handle_contact_form():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        if not all([name, email, message]):
            return jsonify({'error': 'All fields are required'}), 400

        # Log the contact form submission
        current_app.logger.info(f"""
        New Contact Form Submission:
        Name: {name}
        Email: {email}
        Message: {message}
        Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """)

        return jsonify({'message': 'Message received successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Error processing contact form: {str(e)}")
        return jsonify({'error': 'Failed to process message'}), 500

@bp.route('/star.svg')
def serve_star():
    """Serve the star icon."""
    return send_from_directory(os.path.join(current_app.root_path, 'static'), 'star.svg') 