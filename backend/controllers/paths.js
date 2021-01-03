var paths = require('../models/paths');

exports.getAllPaths = function(req, res, next){
  paths.getAll(req.query.userID, (rows) => {
    res.json(rows);
  })
}; 

exports.createPath = function(req, res, next){
  paths.create(req.body.userUID, req.body.coordinates, req.body.isAirPlane, (rows) => {
    res.json(rows);
  });
}