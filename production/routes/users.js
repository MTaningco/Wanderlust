var express = require('express');
var router = express.Router();
var users = require('../controllers/users');
var tokenHeader = require('../controllers/tokenHeader');

/* GET if a username exists */
router.get('/exists', users.exists);
/* POST a new user */
router.post('/create', users.createUser);
/* POST login credientials */
router.post('/login', users.login);
/* POST if a token is valid */
router.post('/checkToken', tokenHeader.verifyToken, users.verify);

module.exports = router;
