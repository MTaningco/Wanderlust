var landmarks = require('../models/landmarks');
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default';

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