var pool = require('./db');

var Paths = {
  create : async function(userUID, pathNodes, isAirplane, callback){
    var isAirPlaneParam = isAirplane ? 't' : 'f';
    const pathInfoResult = await pool.query(`
      insert into PathInfo(user_uid, is_airplane) 
      values ($1, $2) 
      returning *
    `, [userUID, isAirPlaneParam]);
    const pathNodesQuery = "insert into PathNodes(path_uid, path_order, latitude, longitude) values ";

    console.log(pathInfoResult.rows[0]);
    const path_uid = pathInfoResult.rows[0].path_uid;
    var nodesAsQueryArray = [];
    var parametersArray = [];
    for(var i = 0; i < pathNodes.length; i++){
      nodesAsQueryArray.push(`($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`);
      parametersArray.push(path_uid);
      parametersArray.push(i);
      parametersArray.push(pathNodes[i][1]);
      parametersArray.push(pathNodes[i][0]);
    }
    var nodesAsQuery = nodesAsQueryArray.join(', ');
    console.log(pathNodesQuery + nodesAsQuery);
    await pool.query(pathNodesQuery + nodesAsQuery, parametersArray);
    callback(pathInfoResult.rows[0]);
  },

  getAll : async function(userUID, callback){
    const allPaths = await pool.query(`
      select pn.path_uid, pi.is_airplane, pn.path_order, latitude, longitude 
      from pathinfo pi 
      join pathnodes pn on pi.path_uid = pn.path_uid 
      where user_uid = $1
      order by pn.path_uid, pn.path_order asc`, [userUID]);
      
    const data = allPaths.rows;
    const output = [];
    for(var i = 0; i < data.length; i++){
      if(output.length == 0 || output[output.length - 1].path_uid !== data[i].path_uid){
        var longitude = parseFloat(data[i].longitude);
        var latitude = parseFloat(data[i].latitude);
        var currentPath = {
          type: "LineString", 
          coordinates: [[longitude, latitude]], 
          id:`path_${data[i].path_uid}`, 
          path_uid: data[i].path_uid, 
          isAirPlane: data[i].is_airplane
        };
        output.push(currentPath);
      }
      else{
        
        var longitude = parseFloat(data[i].longitude);
        var latitude = parseFloat(data[i].latitude);
        output[output.length - 1].coordinates.push([longitude, latitude]);
      }
    }
    callback(output);
  }
}

module.exports = Paths;