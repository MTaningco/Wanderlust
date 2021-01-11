var express = require('express');
var router = express.Router();
var users = require('../controllers/users');

//post to make a new account
router.post('/create', users.createUser);

//post to check if the account is properly authenticated
router.post('/login', users.login);

module.exports = router;
