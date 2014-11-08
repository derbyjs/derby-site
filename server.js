var expressApp = require('./src/server');
var port = process.env.PORT || 4000;
var server = expressApp.listen(port, function(err) {
  console.log('%d listening. Go to: http://localhost:%d/', process.pid, port);
});
