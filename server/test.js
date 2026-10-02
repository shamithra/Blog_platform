const http = require('http');
const connectDB = require('./db');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Category = require('./models/Category');

async function testBackend() {
  console.log('--- STARTING BACKEND AUTOMATED TEST ---');

  try {
    // 1. Database Connection & Seed Test
    await connectDB();
    console.log('✅ DB Connection & Seed verified.');

    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const commentCount = await Comment.countDocuments();
    const categoryCount = await Category.countDocuments();

    console.log(`📊 Statistics: ${userCount} Users, ${categoryCount} Categories, ${postCount} Posts, ${commentCount} Comments.`);

    if (userCount < 1 || postCount < 1 || categoryCount < 1) {
      throw new Error('Seed data missing or database not initialized properly');
    }

    console.log('🎉 ALL BACKEND CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ BACKEND TEST FAILED:', err);
    process.exit(1);
  }
}

testBackend();
