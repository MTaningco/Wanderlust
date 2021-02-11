var SunCalc = require('suncalc');

var Globe = {
  /**
   * Gets the current subsolar point.
   * @param {*} callback - the callback function that processes the data.
   */
  getSubsolar : function(callback){
    const output = {
      latitude: 0,
      longitude: 0
    };
    var long = -180;
    var peak = 0;
    //TODO: instantiate current date here instead.
    while(long < 180){
      var maxLat = this.getMaxLatAtLong(long);
      if(maxLat[0] > peak){
        peak = maxLat[0];
        output.latitude = maxLat[1];
        output.longitude = long;
      }
      long += 0.5;
    }
    callback(output);
  },

  /**
   * Gets the latitude with the maximum solar azimuth angle.
   * @param {number} longitude - the longitude to check all latitudes with
   */
  getMaxLatAtLong : function (longitude){
    //TODO: use a new parameter for the date to use with
    var lat = -90;
    var peak = 0;
    var result = [0, 0];
    while(lat < 90){
      var altitude = SunCalc.getPosition(new Date(), lat, longitude);
      if(altitude.altitude > peak){
        peak = altitude.altitude;
        result[0] = peak;
        result[1] = lat;
      }
      lat += 0.05;
    }
    return result;
  }
}

module.exports = Globe;