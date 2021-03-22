var pool = require('./db');
var bcrypt = require('bcrypt');

const saltRounds = 10;

var Users = {
  /**
   * Creates a user.
   * @param {string} email - the email of the new user
   * @param {string} password - the password of the new user
   * @param {string} username - the username of the new user
   * @param {*} callback - the callback function that processes the new user
   */
  createUser : async function(email, password, username, callback){
    // Hash the email
    bcrypt.hash(email, saltRounds, async function(err, hashedEmail) {
      // Hash the password
      bcrypt.hash(password, saltRounds, async function(err, hashedPassword) {
        try{
          const queryResult = await pool.query(`
            insert into AppUsers(email, password, username) 
            values ($1, $2, $3) 
            returning * 
          `, [hashedEmail, hashedPassword, username]);
          callback(queryResult.rows[0]);
        }
        catch(err){
          callback(null);
        }
      });
    });
  },

  /**
   * Gets a user based on credentials.
   * @param {string} username - the username of the user
   * @param {string} password - the password of the user
   * @param {*} callback - the callback function that processes the result
   */
  getUser : async function(username, password, callback){
    const dbPassword = await pool.query(`
      select user_uid, username, password 
      from AppUsers 
      where username = $1
    `, [username]);
    const data = dbPassword.rows;
    if(data.length === 1){
      bcrypt.compare(password, data[0].password, function(err, result) {
        callback(result, data[0]);
      });
    }
    else{
      callback(null);
    }
  },

  /**
   * Checks if a username exists.
   * @param {string} username - the username to check
   * @param {*} callback - the callback function that processes the result
   */
  exists : async function(username, callback){
    // console.log(username);
    const dbPassword = await pool.query(`
      select case when count(*) = 1 then 'true' else 'false' end as isExist 
      from AppUsers 
      where username = $1
    `, [username]);
    callback(dbPassword.rows);
  },

  /**
   * Hashes the access and refresh token and puts it in the database.
   * @param {number} user_uid - the unique id of the user
   * @param {string} accessToken - the encoded access token
   * @param {string} refreshToken - the encoded refresh token
   * @param {*} callback - the callback function
   */
  rememberTokens : async function(user_uid, accessToken, refreshToken, callback){
    bcrypt.hash(accessToken, saltRounds, async function(err, hashedAccess) {
      bcrypt.hash(refreshToken, saltRounds, async function(err, hashedRefresh) {
        try{
          const queryResult = await pool.query(`
            update AppUsers
            set access_hash = $1, refresh_hash = $2
            where user_uid = $3
            returning *
          `, [hashedAccess, hashedRefresh, user_uid]);
          callback({
            accessToken: accessToken,
            refreshToken: refreshToken
          });
        }
        catch(e){
          callback(null);
        }
      });
    });
  },

  /**
   * Verifies the encoded refresh token with the database.
   * @param {*} user_uid - the unique id of the user
   * @param {*} token - the encoded refresh token
   * @param {*} callback - the callback function
   */
  verifyRefreshToken: async function(user_uid, token, callback){
    const hashedRefresh = await pool.query(`
      select refresh_hash 
      from AppUsers 
      where user_uid = $1
    `, [user_uid]);
    const data = hashedRefresh.rows;
    if(data.length === 1){
      bcrypt.compare(token, data[0].refresh_hash, function(err, result) {
        callback(result);
      });
    }
    else{
      callback(null);
    }
  },

  /**
   * Verifies the encoded access token with the database.
   * @param {*} user_uid - the unique id of the user
   * @param {*} token - the encoded refresh token
   * @param {*} callback - the callback function
   */
  verifyAccessToken: async function(user_uid, token, callback){
    const hashedRefresh = await pool.query(`
      select access_hash 
      from AppUsers 
      where user_uid = $1
    `, [user_uid]);
    const data = hashedRefresh.rows;
    if(data.length === 1){
      bcrypt.compare(token, data[0].access_hash, function(err, result) {
        callback(result);
      });
    }
    else{
      callback(null);
    }
  }
}

module.exports = Users;