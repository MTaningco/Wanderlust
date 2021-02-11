/**
 * Verifies that a token exists.
 * @param {*} req - the request body, containing the authorization header
 * @param {*} res - the result body
 * @param {*} next - the next function to execute
 */
exports.verifyToken = function(req, res, next){
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
