/**
 * @author Jan Hoping, Jakob Danel
 */



var express = require('express');
var router = express.Router();

/* GET show Tour page. */
router.get('/', function(req, res, next) {
  res.render('showTours', {});
});

module.exports = router;
