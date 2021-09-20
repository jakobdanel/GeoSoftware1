/**
 * @author Jan Hoping, Jakob Danel
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Sightseeing Page' });
});

module.exports = router;
