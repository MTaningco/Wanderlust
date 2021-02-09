var express = require('express');
var router = express.Router();
var pathController = require('../controllers/paths');
var tokenHeader = require('../controllers/tokenHeader');

router.get('/', tokenHeader.verifyToken, pathController.getAllPaths);
router.post('/', tokenHeader.verifyToken, pathController.createPath);
router.delete('/', tokenHeader.verifyToken, pathController.deletePath);

module.exports = router;
