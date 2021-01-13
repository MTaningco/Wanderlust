var express = require('express');
var router = express.Router();
var users = require('../controllers/users');
var tokenHeader = require('../controllers/tokenHeader');

//post to make a new account
router.post('/create', users.createUser);

//post to check if the account is properly authenticated
router.post('/login', users.login);

router.get('/exists', users.exists);

router.post('/checkToken', tokenHeader.verifyToken, users.verify);

module.exports = router;
