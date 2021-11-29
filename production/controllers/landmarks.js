var landmarks = require('../models/landmarks');

/**
 * Gets all landmarks of a user.
 * @param {*} req - the request body, containing the token
 * @param {*} res - the result body, containing the returned landmarks
 * @param {*} next - the next function to execute
 */
exports.getAllLandmarks = function(req, res, next){
  landmarks.getAll(req.decoded.user_uid, (rows) => {
    res.json(rows);
  })
}; 

/**
 * Updates a landmark.
 * @param {*} req - the request body, containing the token and updated landmark attributes
 * @param {*} res - the result body, containing the returned landmark
 * @param {*} next - the next function to execute
 */
exports.updateLandmark = function(req, res, next){
  landmarks.update(req.decoded.user_uid, req.body.landmark_uid, req.body.name, req.body.description, req.body.coordinates[1], req.body.coordinates[0], (rows) => {
    res.json(rows);
  });
}

/**
 * Deletes a landmark.
 * @param {*} req - the request body, containing the token and unique landmark id
 * @param {*} res - the result body, containing the returned landmark
 * @param {*} next - the next function to execute
 */
exports.deleteLandmark = function(req, res, next){
  landmarks.delete(req.decoded.user_uid, req.body.landmark_uid, (rows) => {
    console.log("delete landmark query result", rows);
    res.json(rows);
  });
}

/**
 * Creates a landmark.
 * @param {*} req - the request body, containing the token and new landmark attributes
 * @param {*} res - the result body, containing the returned landmark
 * @param {*} next - the next function to execute
 */
exports.createLandmark = function(req, res, next){
  landmarks.create(req.decoded.user_uid, req.body.landmarkName, req.body.landmarkDescription, req.body.latitude, req.body.longitude, (rows) => {
    console.log("create landmark query result", rows);
    res.json(rows);
  });
}