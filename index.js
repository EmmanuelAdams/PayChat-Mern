const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const searchRoute = require('./routes/search');
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

dotenv.config();

const connection = async () => {
  try {
    const mongoUrl =
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_URL
        : process.env.MONGO_URL;
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// Serve static files
app.use(
  '/images',
  express.static(path.join(__dirname, 'public/images'))
);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(function (req, res, next) {
  res.header(
    'Access-Control-Allow-Origin',
    'http://localhost:3000'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    // Generate a unique file name by adding a timestamp to the original file name
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + extension
    );
  },
});

const upload = multer({ storage });

// Upload profile picture
app.post(
  '/api/upload',
  upload.single('file'),
  (req, res) => {
    try {
      return res.status(200).json({
        message: 'File uploaded successfully.',
        filename: req.file.filename,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

app.put(
  '/api/users/:id/profile-picture',
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res
          .status(404)
          .json({ error: 'User not found' });
      }

      // Delete the old profile picture
      if (user.profilePicture) {
        const imagePath = path.join(
          __dirname,
          'public/images',
          user.profilePicture
        );
        await fs.unlink(imagePath);
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

// Routes
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/search', searchRoute);

// Start the server
const PORT =
  process.env.NODE_ENV === 'test'
    ? 5000
    : process.env.PORT || 8800;
const server = app.listen(PORT, async () => {
  await connection();
  console.log(`Backend server is running on port ${PORT}`);
});

module.exports = server;
