var express = require('express');
var router = express.Router();
var pathController = require('../controllers/paths');

router.get('/', pathController.getAllPaths);
router.post('/', pathController.createPath);

module.exports = router;
