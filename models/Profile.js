const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'Tahseen Ahmed' },
  title: { type: String, default: 'Full Stack Developer' },
  subtitle: { type: String, default: 'Building digital experiences with clean code & creative thinking' },
  bio: { type: String, default: '' },
  email: { type: String, default: '' },
  location: { type: String, default: 'Sukkur, Sindh, Pakistan' },
  institute: { type: String, default: 'Sukkur IBA University' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  profileImage: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
  cvUrl: { type: String, default: null },
  available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
