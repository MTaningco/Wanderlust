var landmarks = require('../models/landmarks');

exports.getAllLandmarks = function(req, res, next){
  landmarks.getAll(req.query.userID, (rows) => {
    res.json(rows);
  })
}; 

exports.createLandmark = function(req, res, next){
  landmarks.create(req.body.userUID, req.body.landmarkName, req.body.landmarkDescription, req.body.latitude, req.body.longitude, (rows) => {
    res.json(rows);
  });
}