import { useState, useEffect } from 'react'
import { Home, User, Mail, LogOut } from 'lucide-react'
import CreatePost from './components/CreatePost'
import ManagePosts from './components/ManagePosts'

const accentColor = {
  bg: 'bg-teal-700',
  hover: 'hover:bg-teal-800',
  text: 'text-white',
  border: 'border-teal-700',
  focus: 'focus:ring-teal-500'
}

const PostTypeSelector = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">Choose Post Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelect('blog')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left group"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-700">Blog Post</h3>
            <p className="text-gray-600">Write an article, share your thoughts, or create a tutorial.</p>
          </button>
          <button
            onClick={() => onSelect('photo')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left group"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-700">Photo Post</h3>
            <p className="text-gray-600">Share your photography work with a beautiful gallery layout.</p>
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/blog/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-black">Contact Me</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            type="text" 
            id="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="your@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea 
            id="message" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="Your message here..."
            required
          ></textarea>
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {success && (
          <div className="text-green-500 text-sm">{success}</div>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full ${accentColor.bg} ${accentColor.text} ${accentColor.hover} px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showPostTypeSelector, setShowPostTypeSelector] = useState(false)
  const [postType, setPostType] = useState(null)
  const [posts, setPosts] = useState([])
  const [userPosts, setUserPosts] = useState([])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setIsLoggedIn(true);
        setUserInfo(userData);
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const fetchUserPosts = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch('/api/blog/user/posts', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Use the type field from the server response
        const transformedPosts = data.posts.map(post => ({
          ...post,
          type: post.type || (post.img_url ? 'photo' : 'blog') // Fallback to img_url check if type is not set
        }));
        setUserPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Use the type field from the server response
        const transformedPosts = data.posts.map(post => ({
          ...post,
          type: post.type || (post.img_url ? 'photo' : 'blog') // Fallback to img_url check if type is not set
        }));
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchPosts();
    
    // Check for login success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      // Remove the parameter from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Fetch user info again
      fetchUserInfo();
    }

    if (isLoggedIn) {
      fetchUserPosts();
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    try {
      window.location.href = '/api/auth/google/login';
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please try again later.');
    }
  }

  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      handleLogin();
    } else if (userInfo?.email !== 'aslesha2909@gmail.com') {
      alert('Only the admin can create posts.');
    } else {
      setShowPostTypeSelector(true);
    }
  }

  const handlePostTypeSelect = (type) => {
    setPostType(type);
    setShowPostTypeSelector(false);
    setShowCreatePost(true);
  }

  const handlePostCreated = (newPost) => {
    // Transform the new post to include type information and ensure all fields are present
    const transformedPost = {
      ...newPost,
      type: postType, // Use the postType that was selected when creating the post
      is_public: newPost.is_public ?? true, // Default to true if not specified
      created_at: newPost.created_at || new Date().toISOString() // Ensure timestamp is present
    };
    setPosts(prevPosts => [transformedPost, ...prevPosts]);
    setUserPosts(prevPosts => [transformedPost, ...prevPosts]);
    setActiveTab('home');
    setShowCreatePost(false);
  }

  const handlePostEdit = async (postId, updates) => {
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setUserPosts(posts => posts.map(post => 
          post.id === postId ? { ...updatedPost, type: updatedPost.img_url ? 'photo' : 'blog' } : post
        ));
      } else {
        alert('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    }
  };

  const handlePostDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setUserPosts(posts => posts.filter(post => post.id !== postId));
        setPosts(posts => posts.filter(post => post.id !== postId));
        if (selectedPost?.id === postId) {
          setSelectedPost(null);
        }
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const handlePostVisibility = async (postId, isPublic) => {
    try {
      const response = await fetch(`/api/blog/posts/${postId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_public: isPublic }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        const transformedPost = {
          ...updatedPost,
          type: updatedPost.img_url ? 'photo' : 'blog'
        };
        
        setUserPosts(posts => posts.map(post => 
          post.id === postId ? transformedPost : post
        ));
        
        setPosts(posts => posts.map(post => 
          post.id === postId ? transformedPost : post
        ));
      } else {
        alert('Failed to update post visibility');
      }
    } catch (error) {
      console.error('Error updating post visibility:', error);
      alert('Error updating post visibility');
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  const renderHome = () => (
    <div className="space-y-8">
      <div className="py-8">
        <h1 className="text-4xl font-bold text-black mb-4 italic">hi, welcome to my blog! 🌟</h1>
      </div>
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-black">Latest Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.length > 0 ? (
            posts
              .filter(post => post.type === 'blog' && post.is_public)
              .slice(0, 4)
              .map(post => (
              <div 
                key={post.id} 
                className="bg-white rounded-xl border border-gray-200 shadow cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                onClick={() => {
                  if (isLoggedIn) {
                    setSelectedPost(post);
                    setActiveTab('blog');
                  } else {
                    setSelectedPost({...post, preview: true});
                    setActiveTab('blog');
                  }
                }}
              >
                {post.img_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.img_url} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-black">{post.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <span>{post.author?.name || 'Unknown User'}</span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {post.content.replace(/<[^>]*>/g, '')}
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLoggedIn) {
                        setSelectedPost(post);
                        setActiveTab('blog');
                      } else {
                        setSelectedPost({...post, preview: true});
                        setActiveTab('blog');
                      }
                    }}
                    className="mt-4 text-teal-700 hover:text-teal-800 text-sm font-medium"
                  >
                    Read More →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">No posts yet. Create your first post!</p>
          )}
        </div>
        <div className="mt-6">
          <button
            onClick={() => setActiveTab('blog')}
            className="inline-flex items-center justify-center px-4 py-2 border-2 border-teal-700 text-teal-700 hover:bg-teal-50 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            View All Blog Posts →
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-black">Gallery Preview</h2>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
          {posts
            .filter(post => post.type === 'photo' && post.is_public)
            .slice(0, 4)
            .map(post => (
              <div 
                key={post.id} 
                className="break-inside-avoid mb-4 cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => setSelectedImage(post)}
              >
                <img 
                  src={post.img_url} 
                  alt={post.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            ))}
        </div>
        <div className="mt-6">
          <button
            onClick={() => setActiveTab('gallery')}
            className="inline-flex items-center justify-center px-4 py-2 border-2 border-teal-700 text-teal-700 hover:bg-teal-50 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            View More Photos →
          </button>
        </div>
      </section>
    </div>
  )

  const renderBlog = () => (
    <div className="space-y-6">
      {selectedPost ? (
        <div>
          <button 
            onClick={() => setSelectedPost(null)} 
            className="mb-4 text-black hover:bg-gray-100 px-4 py-2 rounded-md"
          >
            ← Back to all posts
          </button>
          {selectedPost.preview ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
              <h1 className="text-3xl font-bold mb-2 text-black">{selectedPost.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span>By {selectedPost.author?.name || 'Unknown User'}</span>
                <span>•</span>
                <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
              </div>
              {selectedPost.img_url && (
                <div className="mb-6 w-full overflow-hidden rounded-lg">
                  <img 
                    src={selectedPost.img_url} 
                    alt={selectedPost.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="prose max-w-none">
                <div 
                  className="text-black"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content.substring(0, Math.floor(selectedPost.content.length * 0.1)) + '...' }}
                />
              </div>
              {!isLoggedIn && (
                <div className="mt-6 text-center">
                  <span className="text-gray-600">Want to read more? </span>
                  <button
                    onClick={handleLogin}
                    className="text-teal-700 hover:text-teal-800 font-medium"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          ) : (
            <article>
              <h1 className="text-3xl font-bold mb-2 text-black">{selectedPost.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span>By {selectedPost.author?.name || 'Unknown User'}</span>
                <span>•</span>
                <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
              </div>
              {selectedPost.img_url && (
                <div className="mb-6 w-full overflow-hidden rounded-lg">
                  <img 
                    src={selectedPost.img_url} 
                    alt={selectedPost.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="prose max-w-none">
                <div 
                  className="text-black"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </div>
            </article>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6 text-black">All Blog Posts</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {posts.length > 0 ? (
              posts
                .filter(post => post.type === 'blog' && post.is_public)
                .map(post => (
                <div 
                  key={post.id} 
                  className="bg-white rounded-xl border border-gray-200 shadow cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                  onClick={() => {
                    if (isLoggedIn) {
                      setSelectedPost(post);
                    } else {
                      setSelectedPost({...post, preview: true});
                    }
                  }}
                >
                  {post.img_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={post.img_url} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold text-black">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <span>{post.author?.name || 'Unknown User'}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {post.content.replace(/<[^>]*>/g, '')}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLoggedIn) {
                          setSelectedPost(post);
                        } else {
                          setSelectedPost({...post, preview: true});
                        }
                      }}
                      className="mt-4 text-teal-700 hover:text-teal-800 text-sm font-medium"
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-8">No posts yet. Create your first post!</p>
            )}
          </div>
        </>
      )}
    </div>
  )

  const renderGallery = () => {
    const photoPosts = posts.filter(post => post.type === 'photo' && post.is_public);
    
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-black">Photo Gallery</h1>
        {selectedImage ? (
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => setSelectedImage(null)} 
              className="mb-4 text-black hover:bg-gray-100 px-4 py-2 rounded-md"
            >
              ← Back to gallery
            </button>
            {selectedImage.preview ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={selectedImage.img_url}
                    alt={selectedImage.title}
                    className="w-full h-auto blur-md"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                    <h2 className="text-2xl font-bold text-white mb-4">{selectedImage.title}</h2>
                    <button
                      onClick={handleLogin}
                      className="text-white hover:text-teal-200 font-medium text-lg"
                    >
                      Sign in to view →
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>By {selectedImage.author?.name || 'Unknown User'}</span>
                    <span>•</span>
                    <span>{new Date(selectedImage.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedImage.content && (
                    <p className="text-gray-600">
                      {selectedImage.content.substring(0, Math.floor(selectedImage.content.length * 0.1)) + '...'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow overflow-hidden">
                <img
                  src={selectedImage.img_url}
                  alt={selectedImage.title}
                  className="w-full h-auto"
                />
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-black">{selectedImage.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>By {selectedImage.author?.name || 'Unknown User'}</span>
                    <span>•</span>
                    <span>{new Date(selectedImage.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedImage.content && (
                    <p className="text-gray-600">{selectedImage.content}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {photoPosts.length > 0 ? (
              photoPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="relative group mb-4 break-inside-avoid cursor-pointer"
                  onClick={() => {
                    if (isLoggedIn) {
                      setSelectedImage(post);
                    } else {
                      setSelectedImage({...post, preview: true});
                    }
                  }}
                >
                  <img
                    src={post.img_url}
                    alt={post.title}
                    className="w-full rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-center p-4">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-sm mt-2">{post.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-8">No photos in the gallery yet.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const renderContact = () => <ContactForm />;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  setActiveTab('home');
                  setSelectedPost(null);
                  setSelectedImage(null);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'home' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Home className="h-5 w-5" />
              </button>
              <button 
                onClick={() => { 
                  setActiveTab('blog'); 
                  setSelectedPost(null);
                  setSelectedImage(null);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'blog' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Blog
              </button>
              <button 
                onClick={() => { 
                  setActiveTab('gallery'); 
                  setSelectedPost(null);
                  setSelectedImage(null);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'gallery' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Gallery
              </button>
              <button 
                onClick={() => {
                  setActiveTab('contact');
                  setSelectedPost(null);
                  setSelectedImage(null);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'contact' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Contact
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn && userInfo?.email === 'aslesha2909@gmail.com' && (
                <button 
                  onClick={handleCreatePost}
                  className="border-2 border-teal-700 text-black hover:bg-teal-50 px-4 py-2 rounded-md text-sm"
                >
                  Create Post
                </button>
              )}
              <div className="flex items-center">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveTab('manage');
                        setSelectedPost(null);
                        setSelectedImage(null);
                      }}
                      className="text-sm text-gray-700 hover:text-gray-900"
                    >
                      {userInfo?.name || 'User'}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="text-black hover:bg-gray-100 px-3 py-2 rounded-md text-sm"
                    >
                      <LogOut className="h-4 w-4 mr-1 inline" /> Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className={`${accentColor.bg} ${accentColor.text} ${accentColor.hover} px-4 py-2 rounded-md text-sm`}
                  >
                    <User className="h-4 w-4 mr-1 inline" /> Login with Google
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPostTypeSelector && (
          <PostTypeSelector
            onSelect={handlePostTypeSelect}
            onClose={() => setShowPostTypeSelector(false)}
          />
        )}
        {showCreatePost ? (
          <CreatePost 
            onClose={() => {
              setShowCreatePost(false);
              setPostType(null);
            }} 
            onPostCreated={handlePostCreated}
            type={postType}
          />
        ) : (
          <>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'blog' && renderBlog()}
            {activeTab === 'gallery' && renderGallery()}
            {activeTab === 'contact' && renderContact()}
            {activeTab === 'manage' && (
              <ManagePosts
                posts={userPosts}
                onEdit={handlePostEdit}
                onDelete={handlePostDelete}
                onToggleVisibility={handlePostVisibility}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Aslesha's Blog !
        </div>
      </footer>
    </div>
  )
} 