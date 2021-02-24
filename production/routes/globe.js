var express = require('express');
var router = express.Router();
var globeController = require('../controllers/globe');

/* GET the globe property subsolar point */
router.get('/', globeController.getSubsolarPoint);

module.exports = router;
