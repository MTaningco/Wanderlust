var pool = require('./db');

var Landmarks = {
  create : async function(userUID, landmarkName, landmarkDescription, latitude, longitude, callback){
    const queryResult = await pool.query(`
      insert into Landmarks(user_uid, landmark_name, landmark_description, longitude, latitude) 
      values ($1, $2, $3, $4, $5) 
      returning *
    `, [userUID, landmarkName, landmarkDescription, longitude, latitude]);
    callback(queryResult.rows[0]);
  },

  update : async function(userUID, landmarkUID, landmarkName, landmarkDescription, latitude, longitude, callback){
    const queryResult = await pool.query(`
      update Landmarks
      set landmark_name = $1, landmark_description = $2, longitude = $3, latitude = $4
      where landmark_uid = $5 and user_uid = $6
      returning *
    `, [landmarkName, landmarkDescription, longitude, latitude, landmarkUID, userUID]);
    callback(queryResult.rows[0]);
  },

  getAll : async function(userUID, callback){
    const allLandmarks = await pool.query(`
      select landmark_uid, landmark_name, landmark_description, longitude, latitude 
      from Landmarks 
      where user_uid = $1
    `, [userUID]);
    const data = allLandmarks.rows;
    const output = [];
    for(var i = 0; i < data.length; i++){
      var longitude = parseFloat(data[i].longitude);
      var latitude = parseFloat(data[i].latitude);
      output.push({
        id: `landmark_${data[i].landmark_uid}`,
        landmark_uid: data[i].landmark_uid,
        name: data[i].landmark_name,
        description: data[i].landmark_description,
        coordinates: [longitude, latitude]
      })
    }
    callback(output);
  }
}

module.exports = Landmarks;