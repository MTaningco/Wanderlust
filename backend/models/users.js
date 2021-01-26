var pool = require('./db');
var bcrypt = require('bcrypt');

const saltRounds = 10;

var Users = {
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

  exists : async function(username, callback){
    // console.log(username);
    const dbPassword = await pool.query(`
      select case when count(*) = 1 then 'true' else 'false' end as isExist 
      from AppUsers 
      where username = $1
    `, [username]);
    callback(dbPassword.rows);
  }
}

module.exports = Users;