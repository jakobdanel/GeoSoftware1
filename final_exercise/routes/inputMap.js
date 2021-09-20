/**
 * @author Jan Hoping, Jakob Danel
 */


var express = require('express');
var router = express.Router();

/* GET input map page. */
router.get('/', function(req, res, next) {
  res.render('inputMap', {});
});

module.exports = router;
