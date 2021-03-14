const dotenv = require("dotenv");
var jwt = require("jsonwebtoken");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default';
const REFRESH_JWT_SECRET_KEY = process.env.REFRESH_JWT_SECRET_KEY || 'default';

/**
 * Parses the token.
 * @param {*} req - the request body, containing the authorization header
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.parseToken = function(req, res, next){
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== undefined){
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  }
  else{
    res.status(403).send('Forbidden');
  }
}; 

/**
 * Verifies the refresh token.
 * @param {*} req - the request body, containing the refresh token
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.verifyRefreshToken = function(req, res, next){
  jwt.verify(req.token, REFRESH_JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      console.log("refresh token verified according to jwt")
      req.decoded = decoded;
      next();
    }
  });
}

/**
 * Verifies the access token.
 * @param {*} req - the request body, containing the access token
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.verifyAccessToken = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      req.decoded = decoded;
      next();
    }
  });
}

/**
 * Generates the access token and refresh token.
 * @param {*} req - the request body, containing the decoded token
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.generateTokens = function(req, res, next){
  jwt.sign({ user_uid: req.decoded.user_uid }, JWT_SECRET_KEY, {expiresIn: "15m"}, function(err, accessToken) {
    if(err){
      res.status(501).send("error in creating access token");
    }
    else{
      // res.json({token});
      jwt.sign({ user_uid: req.decoded.user_uid }, REFRESH_JWT_SECRET_KEY, {expiresIn: "7d"}, function(err, refreshToken) {
        if(err){
          res.status(501).send("error in creating refresh token");
        }
        else{
          req.accessToken = accessToken;
          req.refreshToken = refreshToken;
          next();
        }
      });
    }
  });
}