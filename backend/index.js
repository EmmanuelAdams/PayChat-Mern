const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

const connection = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(error);
  }
};
mongoose.set({
  strictQuery: true,
});

app.use(
  '/images',
  express.static(path.join(__dirname, 'public/images'))
);

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
app.post(
  '/api/upload',
  upload.single('file'),
  (req, res) => {
    try {
      return res
        .status(200)
        .json('File uploaded successfully.');
    } catch (error) {
      console.log(error);
    }
  }
);

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);

const PORT = process.env.PORT || 8800;
app.listen(PORT, async () => {
  await connection();
  console.log(`Backend server is running on port ${PORT}`);
});
