var server = require('./src/server');
var path = require('path');
server.run(path.join(__dirname, '/src/app'));