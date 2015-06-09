var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

var expressJwt = require('express-jwt');

var dbConfig = require('./config/database');
mongoose.connect(dbConfig.url);
mongoose.set('debug', true);

require('./config/passport')(passport);

var index = require('./routes/index');
//var auth = require('./routes/auth')(passport);
var auth = require('./routes/auth');
//var profile = require('./routes/profile');
var account = require('./routes/secure/account');
var profile = require('./routes/secure/profile');
var group = require('./routes/secure/group');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use(session({
  secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index);
app.use('/auth', auth);
//app.use('/auth2', auth2);
var authUtil = require('./utils/auth');
app.use('/secure', authUtil.isLoggedIn, account, profile);
app.use('/api', group);
//app.use('/secure', expressJwt({ secret: jwtConfig.secret }));

//var jwtConfig = require('./config/jwt');
//app.use('/secure/api', expressJwt({ secret: jwtConfig.secret }), secureApi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).send({ message: err.message, error: err });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({ message: err.message});
});

module.exports = app;
