import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Edit2, Lock } from 'lucide-react';

const ManagePosts = ({ posts, onEdit, onDelete, onToggleVisibility }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content || '');
  };

  const handleSave = () => {
    onEdit(editingPost.id, {
      title: editTitle,
      content: editContent
    });
    setEditingPost(null);
  };

  const handleCancel = () => {
    setEditingPost(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Manage Your Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="relative">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {post.img_url && (
                <img
                  src={post.img_url}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              {editingPost?.id === post.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      variant="primary"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => onDelete(post.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      onClick={() => handleEdit(post)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => onToggleVisibility(post.id, !post.is_public)}
                      variant={post.is_public ? "outline" : "secondary"}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Lock className="h-4 w-4" />
                      {post.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManagePosts; 