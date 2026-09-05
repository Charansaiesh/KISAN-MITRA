const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { optionalAuth, authenticateJWT, requireOfficer } = require('../middleware/auth');

router.get('/listings', communityController.getListings);
router.post('/listings', optionalAuth, communityController.createListing);
router.post('/listings/:postId/comments', optionalAuth, communityController.addComment);
router.delete('/listings/:postId', communityController.deleteListing);

module.exports = router;
