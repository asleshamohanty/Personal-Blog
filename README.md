# Personal Blog Platform

A modern, feature-rich personal blog platform built with React, Python Flask, and Google OAuth authentication.

## Features

### User Authentication
- Google OAuth integration for secure login
- User profile management
- Session-based authentication

### Blog Posts
- Rich text editor (React Quill) for creating blog posts
- Support for both text and photo posts
- Post preview functionality
- Post management (create, edit, delete)
- Post visibility control (public/private)
- Responsive design for all screen sizes

### Photo Gallery
- Masonry layout for photo display
- Full-screen photo viewing
- Photo post management
- Blurred preview for non-logged-in users

### Content Management
- Create and manage blog posts
- Upload and manage photos
- Toggle post visibility
- Edit and delete posts
- View post statistics

### User Experience
- Responsive navigation
- Clean and modern UI
- Interactive previews
- Smooth transitions
- Loading states and error handling

## Tech Stack

### Frontend
- React.js
- Tailwind CSS for styling
- React Quill for rich text editing
- Lucide React for icons

### Backend
- Python Flask
- SQLAlchemy for database management
- Google OAuth for authentication
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd blog
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SECRET_KEY=your_secret_key
```

5. Initialize the database:
```bash
flask db upgrade
```

### Running the Application

1. Start the backend server:
```bash
cd backend
flask run
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
blog/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── routes/
│   ├── models.py
│   ├── config.py
│   └── requirements.txt
└── README.md
```

## Features in Detail

### Authentication
- Secure Google OAuth integration
- Session management
- Protected routes for authenticated users

### Blog Posts
- Create posts with rich text formatting
- Add images to posts
- Preview posts before publishing
- Manage post visibility
- Edit and delete posts

### Photo Gallery
- Upload and display photos
- Masonry layout for optimal viewing
- Full-screen photo viewing
- Photo descriptions and metadata

### User Interface
- Responsive design
- Modern and clean aesthetics
- Intuitive navigation
- Loading states and error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React.js team for the amazing frontend framework
- Flask team for the Python web framework
- Tailwind CSS for the utility-first CSS framework
- Google for OAuth authentication 