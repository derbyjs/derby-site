var derby = require('derby');
var express = require('express');
var app = derby.createApp('site', __filename);

app.serverUse(module, './markdown');
app.serverUse(module, 'derby-stylus');

app.component(require('d-codemirror'))

app.loadViews(__dirname + '/../../views/app');
app.loadStyles(__dirname + '/../../styles/app');

// TODO move this view function elsewhere
// check if the link matches the first parts of the page's namespace
// so that we can highlight 'docs' when in any sub page
app.proto.linkMatch = function(url, render) {
  var segments = url.split("/");
  var ns = render.ns.split(":");
  var i = 1;
  for(i; i < segments.length; i++) { 
    if(segments[i] !== ns[i-1]) return false;
  }
  return true;
}

// probably a clever way to do this automatically like in ./outline.js
// but its not straightforward without it knowing about the overview.md views
var TOPLEVEL = [
  "derby-0.6",
  "views",
  "models",
  "components",
  "apps",
  "template-syntax"
]
app.proto.gitLink = function(render) {
  var url = "https://github.com/derbyjs/derby-site/blob/master/md/"
  url += render.url
  var ns = render.ns.split(":")
  if(TOPLEVEL.indexOf(ns[ns.length-1]) >= 0) {
    url += "/overview"
  }
  url += ".md"
  return url
}



var expressApp = module.exports = express();

expressApp.get('/', function(req, res, next) {
  var page = app.createPage(req, res, next);
  page.renderStatic('home');
});

expressApp.get('/docs', function(req, res, next) {
  res.redirect('/docs/derby-0.6');
});

var codeMirrorPath = __dirname + '/../../node_modules/d-codemirror/node_modules/codemirror'
expressApp.use('/cm', express.static(codeMirrorPath))

var outlineData = require('./outline').generate(app);
expressApp.get('/*', function(req, res, next) {
  var ns = req.params[0].replace(/\//g, ':');
  if (!app.views.find(ns)) return next();
  var page = app.createPage(req, res, next);
  page.model.setEach('_page', outlineData);
  page.renderStatic(ns);
});
