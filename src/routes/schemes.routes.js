const express = require('express');
const router = express.Router();
const schemesController = require('../controllers/schemes.controller');

router.get('/', schemesController.getSchemes);
router.get('/:id', schemesController.getSchemeById);

module.exports = router;
