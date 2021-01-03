var express = require('express');
var router = express.Router();
var pathController = require('../controllers/landmarks');

router.get('/', pathController.getAllLandmarks);
router.post('/', pathController.createLandmark);

module.exports = router;
