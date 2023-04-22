const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users?query=<search_query>
router.get('/users', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res
        .status(400)
        .json({ message: 'Search query missing' });
    }

    const regex = new RegExp(query, 'i'); // case-insensitive search regex
    const users = await User.find({
      username: regex,
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
