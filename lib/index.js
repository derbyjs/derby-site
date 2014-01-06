var derby = require('derby');

exports.run = run;

function run(app, options, cb) {
  options || (options = {});
  var port = options.port || process.env.PORT || 3000;

  function listenCallback(err) {
    console.log('%d listening. Go to: http://localhost:%d/', process.pid, port);
    cb && cb(err);
  }
  function createServer() {
    if (typeof app === 'string') app = require(app);
    var expressApp = require('./server').setup(app, options);
    var server = require('http').createServer(expressApp);
    server.listen(port, listenCallback);
  }
  derby.run(createServer);
}

// # unless fs.existsSync app.serializedDir
// #   app.serialize store, {minify: true}, (err) ->
// #     throw err if err