const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all community posts
router.get('/', auth, async (req, res) => {
  try {
    const { type, author, tags, limit = 20, page = 1, sort = 'createdAt' } = req.query;

    let query = { isApproved: true };

    if (type) {
      query.type = type;
    }

    if (author) {
      query.author = author;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    const sortField = sort.replace('-', '');

    const posts = await CommunityPost.find(query)
      .populate('author', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture')
      .sort({ [sortField]: sortOrder, isPinned: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get community post by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'name email profilePicture')
      .populate('likes.user', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture')
      .populate('comments.likes.user', 'name email profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create community post
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['post', 'question', 'achievement', 'workout', 'nutrition']).withMessage('Invalid post type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = new CommunityPost({
      ...req.body,
      author: req.user.id,
    });

    await post.save();
    await post.populate('author', 'name email profilePicture');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update community post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    // Check permissions
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedPost = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'name email profilePicture');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete community post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    // Check permissions
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Community post deleted successfully' });
  } catch (error) {
    console.error('Error deleting community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike community post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      post.likes.push({
        user: req.user.id,
        createdAt: new Date(),
      });
    }

    await post.save();
    await post.populate('likes.user', 'name email profilePicture');

    res.json({
      message: existingLike ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !existingLike,
    });
  } catch (error) {
    console.error('Error liking community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to community post
router.post('/:id/comments', [
  auth,
  body('content').notEmpty().withMessage('Comment content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const comment = {
      user: req.user.id,
      content: req.body.content,
      createdAt: new Date(),
      likes: [],
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.user', 'name email profilePicture');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike comment
router.post('/:postId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = comment.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      comment.likes.push({
        user: req.user.id,
        createdAt: new Date(),
      });
    }

    await post.save();

    res.json({
      message: existingLike ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likes.length,
      isLiked: !existingLike,
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check permissions
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin/Unpin post (admin only)
router.post('/:id/pin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      message: post.isPinned ? 'Post pinned' : 'Post unpinned',
      isPinned: post.isPinned,
    });
  } catch (error) {
    console.error('Error pinning post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;