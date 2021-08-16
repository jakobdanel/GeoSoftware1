var express = require('express');
const { mongoPassword } = require('../../exercise06/app/keys');
const mongodb = require('mongodb');
const databaseFunctions = require('./../databaseFunctions');
var router = express.Router();

router.get('/',function(req,res,next){
  let allPois = databaseFunctions.loadAllPois();
});


module.exports = router;
