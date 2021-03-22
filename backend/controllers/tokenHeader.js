const dotenv = require("dotenv");
var jwt = require("jsonwebtoken");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default';
const REFRESH_JWT_SECRET_KEY = process.env.REFRESH_JWT_SECRET_KEY || 'default';

/**
 * Parses the access token.
 * @param {*} req - the request body
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.parseAccessToken = function(req, res, next){
  if(req.cookies.accessToken){
    req.token = req.cookies.accessToken;
    next();
  }
  else{
    res.status(403).send('Forbidden');
  }
}

/**
 * Parses the refresh token.
 * @param {*} req - the request body
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.parseRefreshToken = function(req, res, next){
  if(req.cookies.refreshToken){
    req.token = req.cookies.refreshToken;
    next();
  }
  else{
    res.status(403).send('Forbidden');
  }
}

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
 * Gets the expiry date of the token in milliseconds.
 * @param {*} req - the request body, containing the decoded token
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.getRefreshTokenExpiry = function(req, res, next){
  res.json({
    refreshTokenExpiry: req.decoded.exp * 1000
  })
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

          var currentDate = new Date()
          var accessTokenExpiry = new Date(currentDate.getTime() + 1000*60*15)
          var refreshTokenExpiry = new Date(currentDate.getTime() + 1000*60*60*24*7)
          req.refreshTokenExpiry = refreshTokenExpiry;
          res.cookie('accessToken', accessToken, {httpOnly: true, secure: true, expires: accessTokenExpiry})
          res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, expires: refreshTokenExpiry})
          next();
        }
      });
    }
  });
}

/**
 * Invalidates the tokens in the cookies.
 * @param {*} req - the request body
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.invalidateTokens = function(req, res, next){
  res.cookie('accessToken', "", {httpOnly: true, secure: true, expires: new Date(0)})
  res.cookie('refreshToken', "", {httpOnly: true, secure: true, expires: new Date(0)})
  res.status(200).send("good");
}