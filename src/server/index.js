var derby = require('derby');
var config = require('./config');
var marked = require('marked');
var markedOptions = require('./config/markedOptions');
var gravatar = require('nodejs-gravatar');

process.env.NODE_ENV = config.get('environment');
process.env.MONGO_URL = config.get('mongodb:uri');
process.env.SESSION_SECRET = config.get('session:secret');
process.env.SESSION_KEY = config.get('session:key');
process.env.SESSION_COOKIE = config.get('session:cookie');
process.env.PORT = config.get('port');
process.env.REDIS_HOST = config.get('redis:host');
process.env.REDIS_PORT = config.get('redis:port');
process.env.REDIS_PASSWORD = config.get('redis:pass');

var options = {
  auth: {
    passport: {
      registerCallback: function (req, res, user, done) {
        var model = req.getModel();
        var $user = model.at('auths.' + user.id);
        model.fetch($user, function () {
          $user.set('displayName', $user.get('github.displayName'));
          $user.set('username', $user.get('github.username'));
          $user.set('profileUrl', $user.get('github.profileUrl'));
          var emails = $user.get('github.emails');
          if (emails && emails[0] && emails[0].value) {
            var email = emails[0].value;
            $user.set('email', email);
            $user.set('avatar', gravatar.imageUrl(email));
          } else {
            $user.set('avatar', $user.get('github._json.avatar_url'));
          }
          done();
        })
      },
      successRedirect: '/chat',
      failureRedirect: '/'
    },
    strategies: {
      github: {
        strategy: require('passport-github').Strategy,
        conf: {
          clientID: '93553d0ff80d92a54af3',
          clientSecret: '14e77b063b733111db1e4ea94682ad857fb700ab',
          callbackURL: 'http://localhost:3000/auth/github/callback'
        }
      }
    },
    user: {
      id: true,
      displayName: true,
      username: true,
      profileUrl: true,
      email: true,
      avatar: true,
      online: true
    }
  }
}

marked.setOptions(markedOptions);


exports.run = function (app, opts, cb) {

  //options = options || {};

  derby.run(createServer);

  function createServer() {
    if (typeof app === 'string') app = require(app);

    var expressApp = require('./server.js').setup(app, options);

    var server = require('http').createServer(expressApp);
    server.listen(process.env.PORT, function (err) {
      console.log('%d listening. Go to: http://localhost:%d/', process.pid, process.env.PORT);
      cb && cb(err);
    });
  }
}
