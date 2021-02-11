var pool = require('./db');

var Paths = {
  /**
   * Creates a new path.
   * @param {number} userUID - the unique id of the user
   * @param {number[][]} pathNodes - the coordinates of the path
   * @param {boolean} isAirplane - the boolean for an airplane state
   * @param {string} path_name - the name of the path
   * @param {*} callback - the callback function that processes the new path
   */
  create : async function(userUID, pathNodes, isAirplane, path_name, callback){
    //TODO: change this to be a transaction
    var isAirPlaneParam = isAirplane ? 't' : 'f';
    const pathInfoResult = await pool.query(`
      insert into PathInfo(user_uid, is_airplane, path_name) 
      values ($1, $2, $3) 
      returning *
    `, [userUID, isAirPlaneParam, path_name]);
    const pathNodesQuery = "insert into PathNodes(path_uid, path_order, latitude, longitude) values ";

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
    await pool.query(pathNodesQuery + nodesAsQuery, parametersArray);
    callback(pathInfoResult.rows[0]);
  },

  /**
   * Gets all paths of a user.
   * @param {number} userUID - the unique id of the user
   * @param {*} callback - the callback function that processes the paths
   */
  getAll : async function(userUID, callback){
    const allPaths = await pool.query(`
      select pi.path_uid, pi.is_airplane, pn.path_order, latitude, longitude, pi.path_name
      from pathinfo pi 
      left join pathnodes pn on pi.path_uid = pn.path_uid 
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
          isAirPlane: data[i].is_airplane,
          path_name: data[i].path_name
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
  },

  /**
   * Deletes a path.
   * @param {number} userUID - the unique id of the user
   * @param {number} pathUID - the unique id of the path
   * @param {*} callback - the callback function that processes the deleted path
   */
  delete : async function(userUID, pathUID, callback){
    const queryResult = await pool.query(`
      delete from PathInfo
      where path_uid = $1 and user_uid = $2
      returning *
    `, [pathUID, userUID]);
    callback(queryResult.rows[0]);
  },

  /**
   * Updates a path.
   * @param {number} userUID - the unique id of the user
   * @param {number} pathUID - the unique id of the path
   * @param {string} pathName - the name of the path
   * @param {boolean} isAirPlane - the boolean for an airplane state
   * @param {number[][]} coordinates - the coordinates of the path
   * @param {*} callback - the callback function that processes the updated path
   */
  update : async function(userUID, pathUID, pathName, isAirPlane, coordinates, callback){
    // const queryCheck = await pool.query(`select * from PathInfo where path_uid = $1 and user_uid = $2`, [pathUID, userUID]);
    // if(queryCheck.rows[0]){

    // }
    //TODO: check if user and path exists together
    //TODO: change this to be a transaction
    const queryResult = await pool.query(`
      update PathInfo
      set path_name = $1, is_airplane = $2
      where path_uid = $3 and user_uid = $4
      returning *
    `, [pathName, isAirPlane, pathUID, userUID]);
    const queryResult1 = await pool.query(`
      delete from PathNodes
      where path_uid = $1 and exists(
        select * from PathInfo 
        pi left join PathNodes pn on pi.path_uid = pn.path_uid 
        where pi.path_uid = $2 and pi.user_uid = $3
      )
      returning *
    `, [pathUID, pathUID, userUID]);
    // console.log(queryResult1.rows[0]);
    if(queryResult1.rows[0]){
      const pathNodesQuery = "insert into PathNodes(path_uid, path_order, latitude, longitude) values ";
      
      var nodesAsQueryArray = [];
      var parametersArray = [];
      for(var i = 0; i < coordinates.length; i++){
        nodesAsQueryArray.push(`($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`);
        parametersArray.push(pathUID);
        parametersArray.push(i);
        parametersArray.push(coordinates[i][1]);
        parametersArray.push(coordinates[i][0]);
      }
      var nodesAsQuery = nodesAsQueryArray.join(', ');
      await pool.query(pathNodesQuery + nodesAsQuery, parametersArray);
    }
    callback(queryResult.rows[0]);
  }
}

module.exports = Paths;