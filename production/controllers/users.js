var users = require('../models/users');
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default';

exports.login = function(req, res, next){
  users.getUser(req.body.username, req.body.password, (result, data) => {
    if(result){
      jwt.sign({ user_uid: data.user_uid, username: data.username }, JWT_SECRET_KEY, {expiresIn: "1h"}, function(err, token) {
        if(err){
          res.status(501).send("error at get user");
        }
        else{
          res.json({token});
        }
      });
    }
    else{
      res.status(401).send('Unauthorized');
    }
  })
}; 

exports.createUser = function(req, res, next){
  users.createUser(req.body.email, req.body.password, req.body.username, (rows) => {
    if(rows){
      res.json(rows);
    }
    else{
      res.status(409).send("Failed to make a new user");
    }
  });
}

exports.exists = function(req, res, next){
  users.exists(req.query.username, (rows) => {
    res.json(rows[0]);
  });
}

exports.verify = function(req, res, next){
  jwt.verify(req.token, JWT_SECRET_KEY, function(err, decoded) {
    if(err){
      console.log("error in the token");
      res.json({isTokenValid: false});
    }
    else{
      console.log("good token");
      res.json({isTokenValid: true});
    }
  });
}