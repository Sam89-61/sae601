const express = require('express');
const router = express.Router();
const SocialController = require('../controllers/socialController');
const socialController = new SocialController();
const { authenticateToken } = require('../middleware/auth');
const { socialValidators } = require('../middleware/validators');

router.use(authenticateToken);

// Recherche et données globales
router.get('/search', socialValidators.searchUsers, socialController.searchUsers);
router.get('/data', socialController.getSocialData);
router.get('/public-profile/:userId', socialController.getPublicProfile);

// Gestion des demandes
router.post('/request', socialValidators.sendRequest, socialController.sendFriendRequest);
router.post('/accept', socialValidators.acceptRequest, socialController.acceptFriendRequest);
router.put('/notifications/read', socialController.markNotificationsAsRead);
router.delete('/friend/:id', socialValidators.removeFriend, socialController.removeFriend);

module.exports = router;
