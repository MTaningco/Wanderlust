var express = require('express');
var router = express.Router();
var pathController = require('../controllers/paths');
var tokenHeader = require('../controllers/tokenHeader');
var users = require('../controllers/users');

/* GET all paths of a user */
router.get('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.getAllPaths);
/* POST a new path */
router.post('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.createPath);
/* PUT an updated path */
router.put('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.updatePath);
/* DELETE a path*/
router.delete('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.deletePath);

module.exports = router;
