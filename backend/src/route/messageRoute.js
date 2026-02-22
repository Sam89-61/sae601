const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const messageController = new MessageController();
const { authenticateToken } = require('../middleware/auth');
const { messageValidators, idValidator } = require('../middleware/validators');

router.use(authenticateToken);

router.post('/send', messageValidators.send, messageController.sendMessage);
router.get('/conversation/:id', idValidator, messageController.getConversation);

module.exports = router;
