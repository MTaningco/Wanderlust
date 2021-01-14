var express = require('express');
var router = express.Router();
var pathController = require('../controllers/landmarks');
var tokenHeader = require('../controllers/tokenHeader');

router.get('/', tokenHeader.verifyToken, pathController.getAllLandmarks);
router.post('/', tokenHeader.verifyToken, pathController.createLandmark);

module.exports = router;
