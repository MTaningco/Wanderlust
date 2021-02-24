var paths = require('../models/paths');
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default';

/**
 * Gets all paths of a user.
 * @param {*} req - the request body, containing the token
 * @param {*} res - the result body, containing the returned paths
 * @param {*} next - the next function to execute
 */
exports.getAllPaths = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      paths.getAll(decoded.user_uid, (rows) => {
        res.json(rows);
      })
    }
  });
}; 

/**
 * Creates a path.
 * @param {*} req - the request body, containing the token and new path attributes
 * @param {*} res - the result body, containing the returned path
 * @param {*} next - the next function to execute
 */
exports.createPath = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      paths.create(decoded.user_uid, req.body.coordinates, req.body.isAirPlane, req.body.path_name, (rows) => {
        res.json(rows);
      });
    }
  });
}

/**
 * Deletes a path.
 * @param {*} req - the request body, containing the token and unique path id
 * @param {*} res - the result body, containing the returned path
 * @param {*} next - the next function to execute
 */
exports.deletePath = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      paths.delete(decoded.user_uid, req.body.path_uid, (rows) => {
        res.json(rows);
      });
    }
  });
}

/**
 * Updates a path.
 * @param {*} req - the request body, containing the token and updated path attributes
 * @param {*} res - the result body, containing the returned path
 * @param {*} next - the next function to execute
 */
exports.updatePath = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      paths.update(decoded.user_uid, req.body.path_uid, req.body.path_name, req.body.is_airplane, req.body.coordinates, (rows) => {
        res.json(rows);
      });
    }
  });
}