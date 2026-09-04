const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/listings', communityController.getListings);
router.post('/listings', optionalAuth, communityController.createListing);
router.post('/listings/:postId/comments', optionalAuth, communityController.addComment);

module.exports = router;
