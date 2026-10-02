const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Post = require('../models/Post');

// @route   GET /api/categories
// @desc    Get all categories with post counts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    
    // Add post count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const postCount = await Post.countDocuments({ category: cat._id, status: 'published' });
        return { ...cat, postCount };
      })
    );

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error fetching categories.' });
  }
});

module.exports = router;
