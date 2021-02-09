var paths = require('../models/paths');
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default';

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