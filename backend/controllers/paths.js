var paths = require('../models/paths');

/**
 * Gets all paths of a user.
 * @param {*} req - the request body, containing the token
 * @param {*} res - the result body, containing the returned paths
 * @param {*} next - the next function to execute
 */
exports.getAllPaths = function(req, res, next){
  paths.getAll(req.decoded.user_uid, (rows) => {
    res.json(rows);
  })
}; 

/**
 * Creates a path.
 * @param {*} req - the request body, containing the token and new path attributes
 * @param {*} res - the result body, containing the returned path
 * @param {*} next - the next function to execute
 */
exports.createPath = function(req, res, next){
  paths.create(req.decoded.user_uid, req.body.coordinates, req.body.isAirPlane, req.body.path_name, (rows) => {
    res.json(rows);
  });
}

/**
 * Deletes a path.
 * @param {*} req - the request body, containing the token and unique path id
 * @param {*} res - the result body, containing the returned path
 * @param {*} next - the next function to execute
 */
exports.deletePath = function(req, res, next){
  paths.delete(req.decoded.user_uid, req.body.path_uid, (rows) => {
    res.json(rows);
  });
}

/**
 * Updates a path.
 * @param {*} req - the request body, containing the token and updated path attributes
 * @param {*} res - the result body, containing the returned path
 * @param {*} next - the next function to execute
 */
exports.updatePath = function(req, res, next){
  paths.update(req.decoded.user_uid, req.body.path_uid, req.body.path_name, req.body.is_airplane, req.body.coordinates, (rows) => {
    res.json(rows);
  });
}