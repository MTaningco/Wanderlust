var landmarks = require('../models/landmarks');
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default';

/**
 * Gets all landmarks of a user.
 * @param {*} req - the request body, containing the token
 * @param {*} res - the result body, containing the returned landmarks
 * @param {*} next - the next function to execute
 */
exports.getAllLandmarks = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      landmarks.getAll(decoded.user_uid, (rows) => {
        res.json(rows);
      })
    }
  });
}; 

/**
 * Updates a landmark.
 * @param {*} req - the request body, containing the token and updated landmark attributes
 * @param {*} res - the result body, containing the returned landmark
 * @param {*} next - the next function to execute
 */
exports.updateLandmark = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      landmarks.update(decoded.user_uid, req.body.landmark_uid, req.body.name, req.body.description, req.body.coordinates[1], req.body.coordinates[0], (rows) => {
        res.json(rows);
      });
    }
  });
}

/**
 * Deletes a landmark.
 * @param {*} req - the request body, containing the token and unique landmark id
 * @param {*} res - the result body, containing the returned landmark
 * @param {*} next - the next function to execute
 */
exports.deleteLandmark = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      landmarks.delete(decoded.user_uid, req.body.landmark_uid, (rows) => {
        console.log(rows);
        res.json(rows);
      });
    }
  });
}

/**
 * Creates a landmark.
 * @param {*} req - the request body, containing the token and new landmark attributes
 * @param {*} res - the result body, containing the returned landmark
 * @param {*} next - the next function to execute
 */
exports.createLandmark = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      res.status(401).send('Unauthorized');
    }
    else{
      landmarks.create(decoded.user_uid, req.body.landmarkName, req.body.landmarkDescription, req.body.latitude, req.body.longitude, (rows) => {
        res.json(rows);
      });
    }
  });
}