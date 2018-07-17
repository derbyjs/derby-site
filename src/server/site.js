var path = require('path');
var glob = require('glob');
var parseUrl = require('url').parse;
var derby = require('derby');
var express = require('express');
var app = derby.createApp('site', __filename);

app.serverUse(module, './markdown');
app.serverUse(module, 'derby-stylus');

app.loadViews(__dirname + '/../../views/app');
app.loadStyles(__dirname + '/../../styles/app');

// TODO move this view function elsewhere
// check if the link matches the first parts of the page's namespace
// so that we can highlight 'docs' when in any sub page
app.proto.linkMatch = function(url, render) {
  var segments = url.split('/');
  var ns = render.ns.split(':');
  var i = 1;
  for(i; i < segments.length; i++) {
    if(segments[i] !== ns[i-1]) return false;
  }
  return true;
}

// On startup, find `overview.md` files, which by convention are used for
var IS_OVERVIEW = (function() {
  var mdDirectory = path.resolve(__dirname + '../../../md');
  var overviewFiles = glob.sync('**/overview.md', {cwd: mdDirectory});
  var map = {};
  for (var i = 0; i < overviewFiles.length; i++) {
    var overviewUrl = '/' + path.dirname(overviewFiles[i]);
    map[overviewUrl] = true;
  }
  return map;
})();
app.proto.gitHubEditLink = function(url) {
  var pathname = parseUrl(url).pathname;
  var editLink = 'https://github.com/derbyjs/derby-site/edit/master/md' + pathname;
  if (IS_OVERVIEW[pathname]) {
    editLink += '/overview';
  }
  return editLink + '.md';
};


var expressApp = module.exports = express();

expressApp.get('/', function(req, res, next) {
  var page = app.createPage(req, res, next);
  page.renderStatic('home');
});

expressApp.get('/docs/derby-0.6/*', function(req, res, next) {
  var subpath = req.params[0];
  res.redirect(301, '/docs/derby-0.10/' + subpath);
});

expressApp.get('/docs', function(req, res, next) {
  res.redirect('/docs/derby-0.10');
});

var outlineData = require('./outline').generate(app);
expressApp.get('/*', function(req, res, next) {
  var ns = req.params[0]
    // Ignore trailing slashes in URL pathnames
    .replace(/\/$/, '')
    // Look for a view with a name corresponding to the URL path. View names
    // use colons as separators rather than slashes
    .replace(/\//g, ':');
  if (!app.views.find(ns)) return next();
  var page = app.createPage(req, res, next);
  page.model.setEach('_page', outlineData);
  page.renderStatic(ns);
});
