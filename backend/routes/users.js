var express = require('express');
var router = express.Router();
var users = require('../controllers/users');
var tokenHeader = require('../controllers/tokenHeader');

/* GET if a username exists */
router.get('/exists', users.exists);
/* POST a new user */
router.post('/create', users.createUser);
/* POST login credientials */
router.post('/login', users.login, tokenHeader.generateTokens, users.rememberTokens);
/* POST if a token is valid */
router.post('/checkToken', tokenHeader.parseRefreshToken, tokenHeader.verifyRefreshToken, users.verifyDbRefreshToken, users.acceptRefreshToken);

router.post('/refreshToken', tokenHeader.parseRefreshToken, tokenHeader.verifyRefreshToken, users.verifyDbRefreshToken, tokenHeader.generateTokens, users.rememberTokens);

router.post('/logout', tokenHeader.invalidateTokens);

module.exports = router;
