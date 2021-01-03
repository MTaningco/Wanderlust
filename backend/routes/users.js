var express = require('express');
var router = express.Router();
const pool = require('../models/db');

/* GET users listing. */
router.get('/', async (req, res) => {
  try{
    const allUsers = await pool.query("select * from appusers");
    res.json(allUsers.rows);
  }
  catch(err){
    console.error(err.message);
  }
});

module.exports = router;
