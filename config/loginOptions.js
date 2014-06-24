var gravatar = require('nodejs-gravatar');

module.exports = {
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