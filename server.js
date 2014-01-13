// Generate html from markdown
require('./markdown');

var app = require('./lib/app');
var options = {
  'static': __dirname + '/public'
};

require('./lib').run(app, options);