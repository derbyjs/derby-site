var derby = require('derby');
var express = require('express');
var app = derby.createApp('site', __filename);

app.serverUse(module, './markdown');
app.serverUse(module, 'derby-stylus');
app.loadViews(__dirname + '/../../views/app');
app.loadStyles(__dirname + '/../../styles/app');

var expressApp = module.exports = express();

expressApp.get('/', function(req, res, next) {
  var page = app.createPage(req, res, next);
  page.renderStatic('home');
});

expressApp.get('/docs', function(req, res, next) {
  res.redirect('/docs/derby-0.6');
});

var outlineData = require('./outline').generate(app);
expressApp.get('/*', function(req, res, next) {
  var ns = req.params[0].replace(/\//g, ':');
  if (!app.views.find(ns)) return next();
  var page = app.createPage(req, res, next);
  page.model.setEach('_page', outlineData);
  page.renderStatic(ns);
});
