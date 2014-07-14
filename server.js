var derby = require('derby');
var http  = require('http');
var defaults = require('./config/defaults');
var marked = require('marked');
var markedOptions = require('./config/markedOptions');


for(var key in defaults) {
  process.env[key] = process.env[key] || defaults[key];
}
if(process.env.MONGO_PORT_27017_TCP_ADDR != void 0 && process.env.MONGO_PORT_27017_TCP_PORT != void 0) {
  process.env.MONGO_URL = 'mongodb://'+process.env.MONGO_PORT_27017_TCP_ADDR+':'+process.env.MONGO_PORT_27017_TCP_PORT+'/';
}

marked.setOptions(markedOptions);


derby.run(createServer);

function createServer() {
  var expressApp = require('./server/index');

  http.createServer(expressApp).listen(process.env.PORT, listenCallback);
}

function listenCallback(err) {
  console.log('%d listening. Go to: http://localhost:%d/', process.pid, process.env.PORT);
}