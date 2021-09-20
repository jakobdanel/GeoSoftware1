/**
 * @author Jan Hoping, Jakob Danel
 */
//load required modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

//Loading required router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var inputMapRouter = require('./routes/inputMap');
var inputPOIRouter = require('./routes/inputPOI');
var managePoiRouter = require('./routes/managePoi');
var inputTourRouter = require('./routes/inputTour');
var routeRouter = require('./routes/route');
var manageTourRouter = require('./routes/manageTour');
var busradarRouter = require('./routes/busradar');
var showToursRouter = require('./routes/showTours');
var testRouter = require('./routes/test');

/**
 * The server object
 */
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Configure app
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended : true}));

//Adding all routers to the server.
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/inputMap',inputMapRouter);
app.use('/inputPOI',inputPOIRouter);
app.use('/managePoi',managePoiRouter);
app.use('/inputTour',inputTourRouter);
app.use('/route',routeRouter);
app.use('/manageTour',manageTourRouter);
app.use('/busradar',busradarRouter);
app.use('/showTours',showToursRouter);
app.use('/test',testRouter);
// catch 404 and forward to error handler

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
