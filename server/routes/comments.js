const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

// @route   GET /api/posts/:postId/comments
// @desc    Get all comments for a post (hierarchical)
// @access  Public
router.get('/posts/:postId/comments', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    // Verify post exists (can accept post ID or slug)
    let post;
    if (postId.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(postId);
    } else {
      post = await Post.findOne({ slug: postId });
    }

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username avatar bio role')
      .sort({ createdAt: 1 })
      .lean();

    const currentUserId = req.user ? req.user.id : null;

    // Structure comments into parent and nested replies
    const formattedComments = comments.map(comment => ({
      ...comment,
      likeCount: comment.likes ? comment.likes.length : 0,
      hasLiked: currentUserId ? (comment.likes || []).some(id => id.toString() === currentUserId) : false,
      replies: []
    }));

    const commentMap = {};
    formattedComments.forEach(c => {
      commentMap[c._id.toString()] = c;
    });

    const rootComments = [];
    formattedComments.forEach(c => {
      if (c.parentComment && commentMap[c.parentComment.toString()]) {
        commentMap[c.parentComment.toString()].replies.push(c);
      } else {
        rootComments.push(c);
      }
    });

    res.json(rootComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error fetching comments.' });
  }
});

// @route   POST /api/posts/:postId/comments
// @desc    Add a comment or threaded reply
// @access  Private
router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    let post;
    if (postId.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(postId);
    } else {
      post = await Post.findOne({ slug: postId });
    }

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    let parentId = null;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        parentId = parentComment._id;
      }
    }

    const newComment = await Comment.create({
      post: post._id,
      author: req.user.id,
      content: content.trim(),
      parentComment: parentId
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'username avatar bio role')
      .lean();

    res.status(201).json({
      ...populatedComment,
      likeCount: 0,
      hasLiked: false,
      replies: []
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error adding comment.' });
  }
});

// @route   DELETE /api/comments/:commentId
// @desc    Delete comment
// @access  Private (Comment Author, Post Author, or Admin)
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate('post');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isPostAuthor = comment.post && comment.post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    // Delete child replies if any
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(comment._id);

    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error deleting comment.' });
  }
});

// @route   POST /api/comments/:commentId/like
// @desc    Toggle comment like
// @access  Private
router.post('/comments/:commentId/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const userId = req.user.id;
    const likedIndex = comment.likes.findIndex(id => id.toString() === userId);

    let hasLiked = false;
    if (likedIndex > -1) {
      comment.likes.splice(likedIndex, 1);
      hasLiked = false;
    } else {
      comment.likes.push(userId);
      hasLiked = true;
    }

    await comment.save();

    res.json({
      likeCount: comment.likes.length,
      hasLiked
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error toggling comment like.' });
  }
});

module.exports = router;
