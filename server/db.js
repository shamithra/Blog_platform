const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_platform';

  try {
    console.log(`Connecting to MongoDB at ${mongoURI}...`);
    // Try primary URI with 3 second timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn('⚠️ Local MongoDB connection failed or not running. Starting in-memory MongoDB fallback server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`✅ Started MongoMemoryServer at ${uri}`);
      await mongoose.connect(uri);
      console.log('✅ Connected to in-memory MongoDB database.');
    } catch (memErr) {
      console.error('❌ Failed to start MongoMemoryServer:', memErr);
      process.exit(1);
    }
  }

  // Seed sample data if database is empty
  await seedDatabase();
}

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already populated with initial data.');
      return;
    }

    console.log('🌱 Seeding database with initial users, categories, posts, and comments...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Sample Users
    const userAlex = await User.create({
      username: 'alex_dev',
      email: 'alex@example.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Full Stack Engineer & UI Architect. Passionate about modern web technologies and system design.',
      role: 'admin'
    });

    const userSarah = await User.create({
      username: 'sarah_design',
      email: 'sarah@example.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Product Designer & UX Researcher crafting delightful digital experiences.',
      role: 'user'
    });

    const userMarcus = await User.create({
      username: 'marcus_ai',
      email: 'marcus@example.com',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'AI Safety Researcher & Machine Learning Systems builder.',
      role: 'user'
    });

    // Create Categories
    const catTech = await Category.create({
      name: 'Engineering',
      slug: 'engineering',
      description: 'System architecture, performance optimization, and modern software development practices.',
      color: '#6366f1',
      icon: 'Code2'
    });

    const catDesign = await Category.create({
      name: 'UI & UX Design',
      slug: 'ui-ux-design',
      description: 'Design systems, accessibility, micro-interactions, and interface design.',
      color: '#ec4899',
      icon: 'Palette'
    });

    const catAI = await Category.create({
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'LLMs, Neural Networks, Agentic Workflows, and machine learning infrastructure.',
      color: '#8b5cf6',
      icon: 'Sparkles'
    });

    const catWeb = await Category.create({
      name: 'Web Dev & React',
      slug: 'web-dev',
      description: 'Frontend frameworks, Node.js REST APIs, database design, and web speed.',
      color: '#10b981',
      icon: 'Globe'
    });

    // Create Sample Posts
    const post1 = await Post.create({
      title: 'Building Scalable Full-Stack Applications with Node.js and MongoDB',
      slug: 'building-scalable-full-stack-apps-nodejs-mongodb',
      excerpt: 'Discover design patterns, indexing strategies, and clean API structures for building resilient full-stack web applications with Node.js & MongoDB.',
      content: `## The Modern Full-Stack Era

Building modern web applications requires balancing rapid iteration speed with long-term architecture resilience. In this guide, we dive deep into building production-ready RESTful services with Express, Mongoose, and React.

### Key Architectural Principles

1. **Decoupled Architecture**: Separate your business logic into service modules and controller layers.
2. **Schema Validation**: Use Mongoose schemas with built-in validation rules and index creation.
3. **Optimized Database Queries**: Leverage document projection and index keys for sub-10ms response times.
4. **Resilient Error Handling**: Implement standardized error response middleware.

\`\`\`javascript
// Example: Clean Mongoose Query with Population
const post = await Post.findById(postId)
  .populate('author', 'username avatar bio')
  .populate('category', 'name color slug')
  .lean();
\`\`\`

### Summary

By structuring your schemas carefully and index-optimizing frequent query paths, your MongoDB backed API can effortlessly scale to handle thousands of concurrent requests.`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80',
      author: userAlex._id,
      category: catTech._id,
      tags: ['Node.js', 'MongoDB', 'Backend', 'Architecture'],
      views: 342,
      likes: [userSarah._id, userMarcus._id],
      status: 'published',
      readTime: 5
    });

    const post2 = await Post.create({
      title: 'Designing Ultra-Fluid Web Interfaces with Glassmorphism and CSS Custom Properties',
      slug: 'designing-fluid-web-interfaces-glassmorphism',
      excerpt: 'Learn how to blend translucent backdrop blurs, vibrant gradient accents, and dynamic dark mode toggles into stunning user interface designs.',
      content: `## The Aesthetics of Modern Web Design

First impressions matter enormously in software design. Users expect interfaces to feel alive, dynamic, and visually striking.

### Principles of Modern Glassmorphism

- **Translucent Backdrop**: Utilizing \`backdrop-filter: blur(16px)\` over dynamic gradient backgrounds.
- **Micro-Animations**: Subtle CSS transitions on hover, focus, and state changes (\`transform: translateY(-4px)\`).
- **Harmonious Color Systems**: Defining CSS custom variables for accent colors, gradients, and adaptive dark mode palettes.

\`\`\`css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
}
\`\`\`

Visual design is not just how something looks—it is how effortlessly the user feels while navigating through it.`,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80',
      author: userSarah._id,
      category: catDesign._id,
      tags: ['CSS', 'UI/UX', 'Glassmorphism', 'Frontend'],
      views: 520,
      likes: [userAlex._id, userMarcus._id],
      status: 'published',
      readTime: 4
    });

    const post3 = await Post.create({
      title: 'The Rise of Autonomous AI Agents: Architectures & Tool Use',
      slug: 'rise-of-autonomous-ai-agents',
      excerpt: 'An in-depth look at how large language models are transitioning from static chat interfaces into proactive, tool-using autonomous agentic systems.',
      content: `## From Chatbots to Autonomous Agents

The shift from single-turn conversational models to multi-agent loops with persistent tool invocation represents one of the biggest leaps in AI capability.

### Agentic Loop Components

1. **Perception**: Reading environment state, code files, and user intent.
2. **Reasoning & Planning**: Synthesizing goals into actionable multi-step execution plans.
3. **Tool Execution**: Invoking APIs, reading logs, running commands, and modifying code safely.
4. **Verification**: Evaluating outputs and self-correcting when errors occur.

The future belongs to agents that act as true collaborative pair programmers!`,
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=900&auto=format&fit=crop&q=80',
      author: userMarcus._id,
      category: catAI._id,
      tags: ['AI', 'LLM', 'Agents', 'FutureTech'],
      views: 789,
      likes: [userAlex._id, userSarah._id],
      status: 'published',
      readTime: 6
    });

    // Create Sample Comments
    const comment1 = await Comment.create({
      post: post1._id,
      author: userSarah._id,
      content: 'Fantastic breakdown! The section on Mongoose index optimization saved our team a ton of query latency.',
      likes: [userAlex._id]
    });

    const comment2 = await Comment.create({
      post: post1._id,
      author: userMarcus._id,
      content: 'Great post Alex. Do you recommend using embedded subdocuments or separate collection references for complex comment trees?',
      likes: []
    });

    // Nested Reply
    await Comment.create({
      post: post1._id,
      author: userAlex._id,
      parentComment: comment2._id,
      content: 'Hi Marcus! For deep comment trees, using separate documents with a `parentComment` ObjectId reference scales much better than growing an array in a single parent document!',
      likes: [userMarcus._id]
    });

    await Comment.create({
      post: post2._id,
      author: userAlex._id,
      content: 'That glassmorphism CSS snippet is super clean! Added it straight to my design system variables.',
      likes: [userSarah._id]
    });

    console.log('✅ Database seeded successfully with initial data.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

module.exports = connectDB;
