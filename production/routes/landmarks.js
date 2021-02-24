var express = require('express');
var router = express.Router();
var pathController = require('../controllers/landmarks');
var tokenHeader = require('../controllers/tokenHeader');

/* GET all landmarks of a user*/
router.get('/', tokenHeader.verifyToken, pathController.getAllLandmarks);
/* POST a new landmark */
router.post('/', tokenHeader.verifyToken, pathController.createLandmark);
/* PUT an updated landmark */
router.put('/', tokenHeader.verifyToken, pathController.updateLandmark);
/* DELETE a landmark */
router.delete('/', tokenHeader.verifyToken, pathController.deleteLandmark);

module.exports = router;
