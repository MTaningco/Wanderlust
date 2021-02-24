var express = require('express');
var router = express.Router();
var pathController = require('../controllers/paths');
var tokenHeader = require('../controllers/tokenHeader');

/* GET all paths of a user */
router.get('/', tokenHeader.verifyToken, pathController.getAllPaths);
/* POST a new path */
router.post('/', tokenHeader.verifyToken, pathController.createPath);
/* PUT an updated path */
router.put('/', tokenHeader.verifyToken, pathController.updatePath);
/* DELETE a path*/
router.delete('/', tokenHeader.verifyToken, pathController.deletePath);

module.exports = router;
