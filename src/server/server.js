var express = require('express');
var session = require('express-session');
var favicon = require('serve-favicon');
var serveStatic = require('serve-static');
var compression = require('compression');
var bodyParser = require('body-parser');
var derbyLogin = require('derby-login');
var coffeeify = require('coffeeify');
var hooks = require('./hooks');
var path = require('path');

var connectStore, sessionStore;
if (process.env.REDIS_HOST) {
    var redis = require('redis');

    var redisClient;
    redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
    if (process.env.REDIS_PASSWORD) redisClient.auth(process.env.REDIS_PASSWORD);

    connectStore = require('connect-redis')(session);
    sessionStore = new connectStore({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, pass: process.env.REDIS_PASSWORD});
} else {
    connectStore = require('connect-mongo')(session);
    sessionStore = new connectStore({url: process.env.MONGO_URL});
}

var midError = require('./error');
var derby = require('derby');
var racerBrowserChannel = require('racer-browserchannel');
var liveDbMongo = require('livedb-mongo');
derby.use(require('racer-bundle'));

exports.setup = function setup(app, options, cb) {
    var store = derby.createStore({
        db: liveDbMongo(process.env.MONGO_URL + '?auto_reconnect', {safe: true}),
        redis: redisClient
    });

    var publicDir = path.join(__dirname, '/../../public');

    var expressApp = express()
        .use(favicon(path.join(publicDir, '/images/favicon.ico')))
        .use(compression())
        .use(serveStatic(publicDir));

    if (options && options.static) {
        if (Array.isArray(options.static)) {
            for (var i = 0; i < options.static.length; i++) {
                var o = options.static[i];
                expressApp.use(o.route, serveStatic(o.dir));
            }
        } else {
            expressApp.use(serveStatic(publicDir));
        }
    }

    hooks(store);

    store.on('bundle', function (browserify) {
        // Add support for directly requiring coffeescript in browserify bundles
        browserify.transform({global: true}, coffeeify);

        // HACK: In order to use non-complied coffee node modules, we register it
        // as a global transform. However, the coffeeify transform needs to happen
        // before the include-globals transform that browserify hard adds as the
        // first trasform. This moves the first transform to the end as a total
        // hack to get around this
        var pack = browserify.pack;
        browserify.pack = function (opts) {
            var detectTransform = opts.globalTransform.shift();
            opts.globalTransform.push(detectTransform);
            return pack.apply(this, arguments);
        };

        //browserify.add(publicDir + '/js/jquery.min.js');
        //browserify.add(publicDir + '/js/bootstrap.min.js');
        //browserify.add(publicDir + '/js/app.js');
    });

    expressApp
        .use(require('cookie-parser')(process.env.SESSION_COOKIE))
        .use(session({
            secret: process.env.SESSION_SECRET,
            store: sessionStore
        }))
        .use(racerBrowserChannel(store))
        .use(store.modelMiddleware())
        .use(bodyParser())
        .use(createUserId)
        .use(derbyLogin.middleware(options.auth))
        .use(app.router());

    // Если бы у на были обычные экспрессовские роуты - мы бы положили их СЮДА
    derbyLogin.routes(expressApp, store);

    expressApp.all('*', function (req, res, next) {
        next('404: ' + req.url);
    });

    expressApp.use(midError());

    app.writeScripts(store, publicDir, {}, function () {
    });

    return expressApp;
}

function createUserId(req, res, next) {
    var model = req.getModel();
    var userId = req.session.userId;
    if (!userId) userId = req.session.userId = model.id();
    model.set('_session.userId', userId);
    next();
}


