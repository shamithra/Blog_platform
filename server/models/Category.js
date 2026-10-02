const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#6366f1' // Default indigo accent
  },
  icon: {
    type: String,
    default: 'Tag'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
