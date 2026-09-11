const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  avatar: { type: String, default: '' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  caption: { type: String, required: true, trim: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
