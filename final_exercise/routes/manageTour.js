
/**
 * @author Jan Hoping, Jakob Danel
 */


var express = require('express');
var router = express.Router();

//Get HTML for manage Tour
router.get('/', function(req, res, next) {
  res.render('manageTour', {});
});

module.exports = router;
