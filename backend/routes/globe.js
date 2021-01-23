var express = require('express');
var router = express.Router();
var globeController = require('../controllers/globe');

router.get('/', globeController.getSubsolarPoint);

module.exports = router;
