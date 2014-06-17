var derbyHook = require('derby-hook');
var marked = require('marked');

module.exports = function (store) {
    derbyHook(store);

    var model = store.createModel();
    var $usersQuery = model.query('auths', {online: true});
    model.fetch($usersQuery, function () {
        var users = $usersQuery.get();
        for (var i = 0; i < users.length; i++) {
            var $user = model.at('auths.' + users[i].id);
            $user.set('online', false);
        }
    });

    store.shareClient.use('connect', function (shareRequest, next) {
        var req = shareRequest.req;
        if (req && req.session) shareRequest.agent.connectSession = req.session;
        next();
    });

    store.shareClient.use('connect', function (shareRequest, next) {
        if (!shareRequest.agent.stream.isServer && shareRequest.req && shareRequest.req.session.passport.user) {
            var userId = shareRequest.req.session.passport.user;
            var sessionId = shareRequest.agent.sessionId;
            var model = store.createModel();
            var $user = model.at('auths.' + userId);
            model.subscribe($user, function () {
                $user.set('sessionId', sessionId);
                $user.set('online', true);
            });
            shareRequest.agent.stream.on('end', function () {
                var lastSessionId = $user.get('sessionId');
                if (sessionId === lastSessionId) {
                    $user.set('online', false);
                }
            });
        }

        next();
    });

    store.hook('create', 'messages', function (docId, value, session, backend) {
        var model = store.createModel();
        var $message = model.at('messages.' + docId);
        model.fetch($message, function () {
            $message.set('userId', session.userId);
            $message.set('date', +new Date());
            var text = $message.get('text');
            $message.set('html', marked(text));
        });
    });
}