/**
 * @author Jan Hoping, Jakob Danel
 */


var express = require('express');
var router = express.Router();

/* GET input tour page. */
router.get('/', function(req, res, next) {
  res.render('inputTour', {});
});

module.exports = router;
