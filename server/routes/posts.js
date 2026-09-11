const express = require('express');
const Post = require('../models/Post');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    // Add isLiked field for current user
    const result = posts.map(p => ({
      ...p.toObject(),
      isLiked: p.likedBy.some(id => id.toString() === req.user._id.toString())
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts — create post
router.post('/', protect, async (req, res) => {
  try {
    const { caption, image, location } = req.body;
    if (!caption) return res.status(400).json({ message: 'Caption is required.' });

    const post = await Post.create({
      author: req.user.name,
      authorId: req.user._id,
      avatar: req.user.photo || '',
      location: location || req.user.homeCountry || '',
      image: image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: caption.trim(),
      likes: 0,
      comments: 0,
      likedBy: []
    });
    res.status(201).json({ ...post.toObject(), isLiked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/posts/:id/like — toggle like
router.patch('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likedBy.some(id => id.toString() === userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.user._id);
      post.likes += 1;
    }

    await post.save();
    res.json({ ...post.toObject(), isLiked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id — owner or admin can delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
