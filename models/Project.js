const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  image: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
  tech: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    enum: ['MERN', 'Java', 'Python', 'AI/ML', 'Finance', 'Other'],
    default: 'Other',
  },
  github: {
    type: String,
    default: '',
  },
  live: {
    type: String,
    default: '',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
