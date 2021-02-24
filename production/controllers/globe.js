var globe = require('../models/globe');

/**
 * Gets the subsolar point.
 * @param {*} req - the request body
 * @param {*} res - the result body containing the subsolar point coordinates
 * @param {*} next - the next function to execute
 */
exports.getSubsolarPoint = function(req, res, next){
  globe.getSubsolar((result) => {
    res.json(result);
  });
}