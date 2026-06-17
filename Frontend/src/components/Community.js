import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  FaApple,
  FaComment,
  FaDumbbell,
  FaHeart,
  FaPlus,
  FaQuestionCircle,
  FaShare,
  FaStar,
  FaTrophy,
  FaUsers
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Community.css';

const FALLBACK_POSTS = [
  {
    _id: 'sample-post-1',
    title: 'Morning consistency streak',
    content: 'Finished my fifth early workout this week. The new split is helping me stay on track and recover better.',
    type: 'achievement',
    tags: ['streak', 'motivation', 'morning-routine'],
    isPinned: true,
    isDemoPost: true,
    createdAt: new Date().toISOString(),
    author: { _id: 'coach-1', name: 'Coach Arjun', profilePicture: '' },
    likes: [{ user: { _id: 'demo-1' } }, { user: { _id: 'demo-2' } }],
    comments: [
      {
        _id: 'comment-1',
        user: { _id: 'coach-2', name: 'Trainer Sarah', profilePicture: '' },
        content: 'Strong work. Keep the recovery and hydration up as well.',
        createdAt: new Date().toISOString(),
        likes: []
      }
    ]
  },
  {
    _id: 'sample-post-2',
    title: 'Best post-workout meal ideas?',
    content: 'Looking for simple high-protein options I can prep quickly after evening gym sessions.',
    type: 'nutrition',
    tags: ['meal-prep', 'protein', 'nutrition'],
    isDemoPost: true,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    author: { _id: 'member-1', name: 'Priya S', profilePicture: '' },
    likes: [{ user: { _id: 'demo-2' } }],
    comments: []
  },
  {
    _id: 'sample-post-3',
    title: 'Need help improving squat depth',
    content: 'I can stay stable, but depth is inconsistent. Any mobility drills or warm-up flow suggestions?',
    type: 'question',
    tags: ['mobility', 'squat', 'form'],
    isDemoPost: true,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    author: { _id: 'member-2', name: 'Rahul K', profilePicture: '' },
    likes: [],
    comments: [
      {
        _id: 'comment-2',
        user: { _id: 'coach-3', name: 'Coach Nila', profilePicture: '' },
        content: 'Try ankle mobility work plus goblet squat holds before your main sets.',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        likes: [{ user: { _id: 'demo-3' } }]
      }
    ]
  }
];

const POST_TYPES = ['all', 'post', 'question', 'achievement', 'workout', 'nutrition'];

const normalizePost = (post = {}) => ({
  ...post,
  _id: post._id || `${post.title || 'post'}-${Date.now()}`,
  title: post.title || 'Community update',
  content: post.content || '',
  type: post.type || 'post',
  tags: Array.isArray(post.tags) ? post.tags : [],
  likes: Array.isArray(post.likes) ? post.likes : [],
  comments: Array.isArray(post.comments)
    ? post.comments.map((comment) => ({
        ...comment,
        likes: Array.isArray(comment.likes) ? comment.likes : [],
        user: comment.user || { _id: 'unknown-commenter', name: 'Member', profilePicture: '' }
      }))
    : [],
  media: Array.isArray(post.media) ? post.media : [],
  author: post.author || { _id: 'unknown-author', name: 'Member', profilePicture: '' },
  createdAt: post.createdAt || new Date().toISOString(),
  isPinned: Boolean(post.isPinned),
  isDemoPost: Boolean(post.isDemoPost)
});

const Community = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser._id || currentUser.id || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filters, setFilters] = useState({ type: '', sort: 'createdAt' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [formData, setFormData] = useState({ title: '', content: '', type: 'post', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [filters, pagination.page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(filters.type ? { type: filters.type } : {}),
        sort: filters.sort,
        page: pagination.page,
        limit: 10
      });

      const response = await axios.get(`${API_ENDPOINTS.COMMUNITY}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedPosts = Array.isArray(response.data.posts)
        ? response.data.posts.map(normalizePost)
        : Array.isArray(response.data)
          ? response.data.map(normalizePost)
          : [];

      setPosts(fetchedPosts.length ? fetchedPosts : FALLBACK_POSTS.map(normalizePost));
      setPagination(response.data.pagination || { page: 1, total: fetchedPosts.length, pages: 1 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch community posts');
      setPosts(FALLBACK_POSTS.map(normalizePost));
      setPagination({ page: 1, total: FALLBACK_POSTS.length, pages: 1 });
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_ENDPOINTS.CREATE_COMMUNITY_POST, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts([normalizePost(response.data), ...posts]);
      setShowCreatePost(false);
      setFormData({ title: '', content: '', type: 'post', tags: [] });
      setTagInput('');
      toast.success('Post created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    const targetPost = posts.find((post) => post._id === postId);
    if (!targetPost) return;

    if (targetPost.isDemoPost) {
      setPosts(posts.map((post) => {
        if (post._id !== postId) return post;
        const alreadyLiked = post.likes.some((like) => (like.user?._id || like.user) === currentUserId);
        return {
          ...post,
          likes: alreadyLiked
            ? post.likes.filter((like) => (like.user?._id || like.user) !== currentUserId)
            : [...post.likes, { user: { _id: currentUserId || 'local-user' } }]
        };
      }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_ENDPOINTS.LIKE_COMMUNITY_POST(postId), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map((post) => {
        if (post._id !== postId) return post;
        const alreadyLiked = post.likes.some((like) => (like.user?._id || like.user) === currentUserId);
        return {
          ...post,
          likes: response.data.isLiked
            ? alreadyLiked
              ? post.likes
              : [...post.likes, { user: { _id: currentUserId } }]
            : post.likes.filter((like) => (like.user?._id || like.user) !== currentUserId)
        };
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    const draft = commentDrafts[postId] || '';
    if (!draft.trim()) return;

    const targetPost = posts.find((post) => post._id === postId);
    if (!targetPost) return;

    if (targetPost.isDemoPost) {
      const localComment = {
        _id: `local-comment-${Date.now()}`,
        content: draft,
        createdAt: new Date().toISOString(),
        likes: [],
        user: {
          _id: currentUserId || 'local-user',
          name: currentUser.name || 'You',
          profilePicture: currentUser.profilePicture || ''
        }
      };
      setPosts(posts.map((post) => (post._id === postId ? { ...post, comments: [...post.comments, localComment] } : post)));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      toast.success('Comment added successfully');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_ENDPOINTS.ADD_COMMENT(postId), { content: draft }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map((post) =>
        post._id === postId
          ? { ...post, comments: [...post.comments, normalizePost({ comments: [response.data] }).comments[0]] }
          : post
      ));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    const targetPost = posts.find((post) => post._id === postId);
    if (!targetPost) return;

    if (targetPost.isDemoPost) {
      setPosts(posts.map((post) => {
        if (post._id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment._id !== commentId) return comment;
            const alreadyLiked = comment.likes.some((like) => (like.user?._id || like.user) === currentUserId);
            return {
              ...comment,
              likes: alreadyLiked
                ? comment.likes.filter((like) => (like.user?._id || like.user) !== currentUserId)
                : [...comment.likes, { user: { _id: currentUserId || 'local-user' } }]
            };
          })
        };
      }));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(API_ENDPOINTS.LIKE_COMMENT(postId, commentId), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedPost = await axios.get(API_ENDPOINTS.GET_COMMUNITY_POST(postId), {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map((post) => (post._id === postId ? normalizePost(updatedPost.data) : post)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to like comment');
    }
  };

  const handleSharePost = async (post) => {
    const shareText = `${post.title}\n\n${post.content}`;
    try {
      if (navigator.share && !post.isDemoPost) {
        await navigator.share({ title: post.title, text: shareText });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        toast.success('Post content copied to clipboard');
      } else {
        toast.info('Sharing is not available in this browser');
      }
    } catch (error) {
      toast.info('Share cancelled');
    }
  };

  const addTag = () => {
    const normalizedTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (normalizedTag && !formData.tags.includes(normalizedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, normalizedTag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const stats = useMemo(() => ({
    posts: posts.length,
    questions: posts.filter((post) => post.type === 'question').length,
    achievements: posts.filter((post) => post.type === 'achievement').length
  }), [posts]);

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'question':
        return <FaQuestionCircle />;
      case 'achievement':
        return <FaTrophy />;
      case 'workout':
        return <FaDumbbell />;
      case 'nutrition':
        return <FaApple />;
      default:
        return <FaUsers />;
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'question':
        return 'Question';
      case 'achievement':
        return 'Achievement';
      case 'workout':
        return 'Workout';
      case 'nutrition':
        return 'Nutrition';
      default:
        return 'General';
    }
  };

  const getPostTypeClass = (type) => `type-${type || 'post'}`;
  const isLikedByCurrentUser = (likes = []) => likes.some((like) => (like.user?._id || like.user) === currentUserId);

  if (loading) {
    return <div className="loading">Loading community...</div>;
  }

  return (
    <div className="community">
      <section className="community-hero">
        <div className="community-hero-copy">
          <span className="community-eyebrow">Member Community</span>
          <h2>Build conversations around workouts, wins, nutrition, and support</h2>
          <p>
            Keep members engaged with a cleaner community feed that highlights questions, progress updates,
            and coaching conversations in one professional space.
          </p>
        </div>

        <div className="community-stats">
          <div className="community-stat-card">
            <strong>{stats.posts}</strong>
            <span>Total Posts</span>
          </div>
          <div className="community-stat-card">
            <strong>{stats.questions}</strong>
            <span>Questions</span>
          </div>
          <div className="community-stat-card">
            <strong>{stats.achievements}</strong>
            <span>Achievements</span>
          </div>
        </div>
      </section>

      <section className="community-toolbar">
        <div className="toolbar-left">
          <div className="filter-chips">
            {POST_TYPES.map((type) => (
              <button
                key={type}
                className={`filter-chip ${filters.type === (type === 'all' ? '' : type) ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, type: type === 'all' ? '' : type })}
              >
                {type === 'all' ? 'All Posts' : getPostTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-right">
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="community-select"
          >
            <option value="createdAt">Latest</option>
            <option value="-createdAt">Oldest</option>
            <option value="likes">Most Liked</option>
          </select>
          <button className="btn-primary" onClick={() => setShowCreatePost(true)}>
            <FaPlus /> Create Post
          </button>
        </div>
      </section>

      {showCreatePost && (
        <div className="modal-overlay">
          <div className="modal-content community-modal">
            <div className="modal-header">
              <h3>Create New Post</h3>
              <button className="close-btn" onClick={() => setShowCreatePost(false)}>
                x
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="post-form">
              <div className="form-group">
                <label>Post Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="post">General Post</option>
                  <option value="question">Question</option>
                  <option value="achievement">Achievement</option>
                  <option value="workout">Workout</option>
                  <option value="nutrition">Nutrition</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your thoughts, ask questions, or post about your fitness journey..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input-row">
                  <input
                    type="text"
                    value={tagInput}
                    placeholder="Add tags..."
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button type="button" className="btn-secondary" onClick={addTag}>
                    Add Tag
                  </button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="remove-tag">
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="posts-section">
        {posts.length === 0 ? (
          <div className="empty-state">
            <FaUsers size={48} />
            <h3>No posts yet</h3>
            <p>Be the first to share your fitness journey with the community.</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <article key={post._id} className={`post-card ${post.isPinned ? 'pinned' : ''}`}>
                <div className="post-header">
                  <div className="post-author">
                    <img
                      src={post.author.profilePicture || '/default-avatar.png'}
                      alt={post.author.name}
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <div className="author-row">
                        <h4>{post.author.name}</h4>
                        {post.isPinned && (
                          <span className="pinned-badge">
                            <FaStar /> Pinned
                          </span>
                        )}
                      </div>
                      <span className="post-date">{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={`post-type ${getPostTypeClass(post.type)}`}>
                    {getPostTypeIcon(post.type)}
                    <span>{getPostTypeLabel(post.type)}</span>
                  </div>
                </div>

                <div className="post-content">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>

                  {post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="post-actions">
                  <button
                    className={`action-btn ${isLikedByCurrentUser(post.likes) ? 'liked' : ''}`}
                    onClick={() => handleLikePost(post._id)}
                  >
                    <FaHeart />
                    <span>{post.likes.length}</span>
                  </button>

                  <button
                    className={`action-btn ${selectedPost === post._id ? 'active' : ''}`}
                    onClick={() => setSelectedPost(selectedPost === post._id ? null : post._id)}
                  >
                    <FaComment />
                    <span>{post.comments.length}</span>
                  </button>

                  <button className="action-btn" onClick={() => handleSharePost(post)}>
                    <FaShare />
                    <span>Share</span>
                  </button>
                </div>

                {selectedPost === post._id && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {post.comments.length === 0 ? (
                        <div className="comment-empty">No comments yet. Start the conversation.</div>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment._id} className="comment">
                            <img
                              src={comment.user.profilePicture || '/default-avatar.png'}
                              alt={comment.user.name}
                              className="comment-avatar"
                            />
                            <div className="comment-content">
                              <div className="comment-header">
                                <strong>{comment.user.name}</strong>
                                <span className="comment-date">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p>{comment.content}</p>
                              <button
                                className={`comment-like ${isLikedByCurrentUser(comment.likes) ? 'liked' : ''}`}
                                onClick={() => handleLikeComment(post._id, comment._id)}
                              >
                                <FaHeart />
                                <span>{comment.likes.length}</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={(e) => handleAddComment(post._id, e)} className="comment-form">
                      <input
                        type="text"
                        value={commentDrafts[post._id] || ''}
                        onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Write a comment..."
                        required
                      />
                      <button type="submit" className="btn-primary">
                        Comment
                      </button>
                    </form>
                  </div>
                )}
              </article>
            ))}

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn-secondary"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <button
                  className="btn-secondary"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Community;
