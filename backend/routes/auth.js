const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const ErrorResponse = require('../utils/errorResponse');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    // Generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      req.body.password,
      salt
    );

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// LOGIN
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    })
      .select('+password')
      .lean();
    // !user && res.status(404).json('user not found');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    delete user.password;
    // !validPassword &&
    //   res.status(400).json('Wrong password');

    if (!validPassword) {
      return next(
        new ErrorResponse('Wrong credentials', 400)
      );
    }

    if (!validPassword || !user) {
      return next(
        new ErrorResponse('Wrong credentials', 400)
      );
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
