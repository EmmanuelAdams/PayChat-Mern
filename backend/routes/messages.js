const router = require('express').Router();
const Message = require('../models/Message');

// Add
router.post('/', async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:messageId', async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(
      req.params.messageId
    );
    if (!deletedMessage) {
      res
        .status(404)
        .json({ message: 'Message not found' });
    } else {
      res
        .status(200)
        .json({ message: 'Message deleted successfully' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
