var derby = require('derby');

var errorApp = derby.createApp();
errorApp.serverUse(module, 'derby-stylus');
errorApp.loadViews(__dirname + '/../../views/error');
errorApp.loadStyles(__dirname + '/../../styles/error');

module.exports = function(err, req, res, next) {
  if (!err) return next();

  var message = err.message || err.toString();
  var status = parseInt(message);
  status = ((status >= 400) && (status < 600)) ? status : 500;

  if (status < 500) {
    console.log(err.message || err);
  } else {
    console.log(err.stack || err);
  }

  var page = errorApp.createPage(req, res, next);
  page.renderStatic(status, status.toString());
}
