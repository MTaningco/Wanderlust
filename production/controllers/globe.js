var globe = require('../models/globe');

exports.getSubsolarPoint = function(req, res, next){
  globe.getSubsolar((result) => {
    res.json(result);
  });
}