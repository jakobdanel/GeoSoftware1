/**
 * @author Jan Hoping, Jakob Danel
 */




var express = require('express');
var router = express.Router();

/* GET Manage Tour page. */
router.get('/', function(req, res, next) {
  res.render('managePOI', {});
});

module.exports = router;
