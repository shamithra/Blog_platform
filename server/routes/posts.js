const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const { auth, optionalAuth } = require('../middleware/auth');

// Helper to generate slug from title
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to estimate read time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const numberOfWords = content ? content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(numberOfWords / wordsPerMinute));
}

// @route   GET /api/posts
// @desc    Get all blog posts (supports search, category, tag, author filtering)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, tag, author, sort } = req.query;
    let query = { status: 'published' };

    // Category filter by slug or ID
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({
        $or: [{ slug: category }, { name: new RegExp(category, 'i') }]
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    // Search query
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { views: -1, createdAt: -1 };
    } else if (sort === 'likes') {
      sortOption = { likes: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar bio role')
      .populate('category', 'name slug color icon')
      .sort(sortOption)
      .lean();

    // Attach comment counts and userLiked flag
    const currentUserId = req.user ? req.user.id : null;
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        const hasLiked = currentUserId ? post.likes.some(id => id.toString() === currentUserId) : false;
        return {
          ...post,
          commentCount,
          likeCount: post.likes ? post.likes.length : 0,
          hasLiked
        };
      })
    );

    res.json(postsWithDetails);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error fetching posts.' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID or Slug & increment views
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(id)
        .populate('author', 'username avatar bio role')
        .populate('category', 'name slug color icon');
    } else {
      post = await Post.findOne({ slug: id })
        .populate('author', 'username avatar bio role')
        .populate('category', 'name slug color icon');
    }

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Increment view count asynchronously
    post.views += 1;
    await post.save();

    const commentCount = await Comment.countDocuments({ post: post._id });
    const currentUserId = req.user ? req.user.id : null;
    const hasLiked = currentUserId ? post.likes.some(uId => uId.toString() === currentUserId) : false;

    const postObj = post.toObject();
    postObj.commentCount = commentCount;
    postObj.likeCount = post.likes ? post.likes.length : 0;
    postObj.hasLiked = hasLiked;

    res.json(postObj);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error fetching post.' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, excerpt, category, coverImage, tags, status } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required.' });
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Find category ID
    let categoryObj = await Category.findById(category);
    if (!categoryObj) {
      categoryObj = await Category.findOne({ slug: category });
    }
    if (!categoryObj) {
      // Default fallback to first category
      categoryObj = await Category.findOne();
    }

    const calculatedExcerpt = excerpt || content.substring(0, 160).replace(/[#*`]/g, '') + '...';
    const parsedTags = Array.isArray(tags) 
      ? tags 
      : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const newPost = await Post.create({
      title: title.trim(),
      slug,
      content,
      excerpt: calculatedExcerpt,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
      author: req.user.id,
      category: categoryObj._id,
      tags: parsedTags,
      status: status || 'published',
      readTime: calculateReadTime(content)
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'username avatar bio role')
      .populate('category', 'name slug color icon');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error creating post.' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post by ID
// @access  Private (Author or Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Authorization check
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this post.' });
    }

    const { title, content, excerpt, category, coverImage, tags, status } = req.body;

    if (title && title !== post.title) {
      post.title = title.trim();
      let baseSlug = slugify(title);
      let slug = baseSlug;
      let counter = 1;
      while (await Post.findOne({ slug, _id: { $ne: post._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      post.slug = slug;
    }

    if (content) {
      post.content = content;
      post.readTime = calculateReadTime(content);
      post.excerpt = excerpt || content.substring(0, 160).replace(/[#*`]/g, '') + '...';
    }

    if (category) {
      let categoryObj = await Category.findById(category);
      if (!categoryObj) categoryObj = await Category.findOne({ slug: category });
      if (categoryObj) post.category = categoryObj._id;
    }

    if (coverImage) post.coverImage = coverImage;
    if (tags) {
      post.tags = Array.isArray(tags) 
        ? tags 
        : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : post.tags);
    }
    if (status) post.status = status;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar bio role')
      .populate('category', 'name slug color icon');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error updating post.' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post by ID
// @access  Private (Author or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    res.json({ message: 'Post and associated comments deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error deleting post.' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like on post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const userId = req.user.id;
    const likedIndex = post.likes.findIndex(id => id.toString() === userId);

    let hasLiked = false;
    if (likedIndex > -1) {
      // Remove like
      post.likes.splice(likedIndex, 1);
      hasLiked = false;
    } else {
      // Add like
      post.likes.push(userId);
      hasLiked = true;
    }

    await post.save();

    res.json({
      likeCount: post.likes.length,
      hasLiked
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error toggling post like.' });
  }
});

module.exports = router;
