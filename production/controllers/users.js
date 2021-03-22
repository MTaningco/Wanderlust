var users = require('../models/users');

/**
 * Logs in a user with the correct credentials.
 * @param {*} req - the request body, containing the user credentials
 * @param {*} res - the result body, containing the resulting credentials combination
 * @param {*} next - the next function to execute
 */
exports.login = function(req, res, next){
  users.getUser(req.body.username, req.body.password, (result, data) => {
    if(result){
      req.decoded = {user_uid : data.user_uid};
      next();
    }
    else{
      res.status(401).send('Unauthorized');
    }
  })
}; 

/**
 * Creates a new user.
 * @param {*} req - the request body, containing the new user attributes
 * @param {*} res - the result body, containing the new user
 * @param {*} next - the next function to execute
 */
exports.createUser = function(req, res, next){
  users.createUser(req.body.email, req.body.password, req.body.username, (rows) => {
    if(rows){
      res.json(rows);
    }
    else{
      res.status(409).send("Failed to make a new user");
    }
  });
}

/**
 * Checks if a username exists.
 * @param {*} req - the request body, containing the username
 * @param {*} res - the result body, containing the resulting existence of a username
 * @param {*} next - the next function to execute
 */
exports.exists = function(req, res, next){
  users.exists(req.query.username, (rows) => {
    res.json(rows[0]);
  });
}

/**
 * Accepts the refresh token.
 * @param {*} req - the request body
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.acceptRefreshToken = function(req, res, next){
  res.json({isTokenValid: true})
}

/**
 * Hashes the tokens and puts it in the database.
 * @param {*} req - the request body, contains the access and refresh tokens
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.rememberTokens = function(req, res, next){
  var accessToken = req.accessToken;
  var refreshToken = req.refreshToken;
  users.rememberTokens(req.decoded.user_uid, accessToken.substr(accessToken.length - 20), refreshToken.substr(refreshToken.length - 20),  (result) => {
    if(result){
      res.json({
        refreshTokenExpiry: req.refreshTokenExpiry
      });
    }
    else{
      res.status(501).send("error in updating refresh and access tokens")
    }
  });
}

/**
 * Verifies the refresh token with the database.
 * @param {*} req - the request body, contains the encoded token and its decoded contents
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.verifyDbRefreshToken = function(req, res, next){
  var token = req.token;
  users.verifyRefreshToken(req.decoded.user_uid, token.substr(token.length - 20), (result) => {
    if(result){
      console.log("refresh token verified according to the db", result)
      next();
    }
    else{
      res.status(401).send('Unauthorized');
    }
  })
}

/**
 * Verifies the access token with the database.
 * @param {*} req - the request body, contains the encoded token and its decoded contents
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.verifyDbAccessToken = function(req, res, next){
  var token = req.token;
  users.verifyAccessToken(req.decoded.user_uid, token.substr(token.length - 20), (result) => {
    if(result){
      console.log("access token verified according to the db", result)
      next();
    }
    else{
      res.status(401).send('Unauthorized');
    }
  })
}