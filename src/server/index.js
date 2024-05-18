var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');

var site = require('./site');
var error = require('./error');
var publicDir = path.join(__dirname, '/../../public');

var expressApp = module.exports = express()
  .use(favicon(path.join(publicDir, '/images/favicon.ico')))
  .use(express.static(publicDir))
  .use(site);

expressApp.all('*', function(req, res, next) {
  next('404: ' + req.url);
});

expressApp.use(error);
