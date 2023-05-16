const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Update user
router.put('/:id/update', async (req, res) => {
  const requestedUserID = req.params.id;
  const currentUserID = req.query.userId;

  if (currentUserID !== requestedUserID) {
    return res
      .status(401)
      .json(
        'You are not authorized to update this account!'
      );
  }

  try {
    const user = await User.findById(requestedUserID);

    if (!user) {
      return res.status(404).json('User not found!');
    }

    const currentDate = new Date();
    const lastUsernameChangeDate =
      user.lastUsernameChangeDate
        ? new Date(user.lastUsernameChangeDate)
        : new Date(0);
    const daysSinceLastChange = Math.floor(
      (currentDate - lastUsernameChangeDate) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastChange < 60) {
      return res
        .status(400)
        .json(
          `You can only change your username after ${
            60 - daysSinceLastChange
          } days.`
        );
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(
        req.body.password,
        salt
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      requestedUserID,
      {
        ...req.body,
        lastUsernameChangeDate: currentDate.toISOString(),
      },
      { new: true }
    );

    res.status(200).json('Account updated successfully');
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  if (
    req.body.userId === req.params.id ||
    req.body.isAdmin
  ) {
    try {
      const user = await User.findByIdAndDelete(
        req.params.id
      );
      res.status(200).json('Account deleted successfully');
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res
      .status(401)
      .json('You can only delete your account!');
  }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  const userId = req.query.userId || req.params.id;

  try {
    const user = await User.findById(userId);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get a user by username
router.get('/', async (req, res) => {
  const username = req.query.username;

  try {
    const user = await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get friends
router.get('/friends/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(
        req.body.userId
      );
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $push: { followings: req.params.id },
        });
        res.status(200).json('User has been followed');
      } else {
        res
          .status(403)
          .json('You already follow this user');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json('You cant follow yourself');
  }
});
// Unfollow a user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(
        req.body.userId
      );
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $pull: { followings: req.params.id },
        });
        res.status(200).json('User has been unfollowed');
      } else {
        res.status(403).json('You dont follow this user');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json('You cant unfollow yourself');
  }
});

// upload user image

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.put(
  '/:id/profilePicture',
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res
          .status(404)
          .json({ error: 'User not found' });
      }

      user.profilePicture = req.file.filename;
      await user.save();

      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
