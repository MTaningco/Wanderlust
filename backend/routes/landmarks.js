var express = require('express');
var router = express.Router();
var pathController = require('../controllers/landmarks');
var tokenHeader = require('../controllers/tokenHeader');
var users = require('../controllers/users');

/* GET all landmarks of a user*/
router.get('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.getAllLandmarks);
/* POST a new landmark */
router.post('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.createLandmark);
/* PUT an updated landmark */
router.put('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.updateLandmark);
/* DELETE a landmark */
router.delete('/', tokenHeader.parseToken, tokenHeader.verifyAccessToken, users.verifyDbAccessToken, pathController.deleteLandmark);

module.exports = router;
