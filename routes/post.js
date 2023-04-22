const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Create a post
router.post('/', async (req, res, next) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    next(err);
  }
});

// Update a post
router.put('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne(req.body);
      res.status(200).json('The post has been updated');
    } else {
      res.status(403).json('You can update only your post');
    }
  } catch (err) {
    next(err);
  }
});

// Delete a post
router.delete('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.delete();
      res.status(200).json('The post has been deleted');
    } else {
      res.status(403).json('You can delete only your post');
    }
  } catch (err) {
    next(err);
  }
});

// Like / Dislike a post
router.put('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const isLiked = post.likes.includes(req.body.userId);
    const update = isLiked
      ? { $pull: { likes: req.body.userId } }
      : { $push: { likes: req.body.userId } };
    await post.updateOne(update);
    const message = isLiked
      ? 'The post has been disliked'
      : 'The post has been liked';
    res.status(200).json(message);
  } catch (err) {
    next(err);
  }
});

// Get a post
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.query.userId);
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json('Post not found');
    }
  } catch (err) {
    next(err);
  }
});

// Get timeline posts
router.get('/timeline/:userId', async (req, res, next) => {
  try {
    const currentUser = await User.findById(
      req.params.userId
    );
    const friendIds = currentUser.followings;
    const posts = await Post.find({
      userId: { $in: [currentUser._id, ...friendIds] },
    });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

// Get user's all posts
router.get('/profile/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
