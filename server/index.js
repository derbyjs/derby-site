var express = require('express');
var session = require('express-session');
var serveStatic = require('serve-static');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var derbyLogin = require('derby-login');
var coffeeify = require('coffeeify');
var hooks = require('./hooks');

var derby = require('derby');

var app = require('../src/app');

var path = require('path');

var racerBrowserChannel = require('racer-browserchannel');
var liveDbMongo = require('livedb-mongo');
var racerBundle = require('racer-bundle');

var error = require('./error');

var mongoUrl = process.env.MONGO_URL + process.env.MONGO_DB;

var connectStore = require('connect-mongo')(session);
var sessionStore = new connectStore({url: mongoUrl});

store = derby.createStore({db: liveDbMongo(mongoUrl + '?auto_reconnect', {safe: true})});

derby.use(racerBundle);

var publicDir = path.join(__dirname, '/../public');
var loginOptions = require('./../config/loginOptions');

hooks(store);

var expressApp = module.exports = express()
  .use(favicon(path.join(publicDir, '/images/favicon.ico')))
  .use(compression())
  .use(serveStatic(publicDir))
  .use(cookieParser(process.env.SESSION_COOKIE))
  .use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore
  }))
  .use(racerBrowserChannel(store))
  .use(store.modelMiddleware())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(createUserId)
  .use(derbyLogin.middleware(loginOptions))
  .use(app.router());

derbyLogin.routes(expressApp, store);

expressApp.all('*', function (req, res, next) {
  next('404: ' + req.url);
})
  .use(error);

app.writeScripts(store, publicDir, {}, function () {
});

function createUserId(req, res, next) {
  var model = req.getModel();
  var userId = req.session.userId;
  if (!userId) userId = req.session.userId = model.id();
  model.set('_session.userId', userId);
  next();
}