### Deploy to Heroku

The default Derby app is already configured for easy deployment to Heroku.
First things first, [signup for Heroku](https://id.heroku.com/signup) and
install [Heroku Toolbelt](https://toolbelt.heroku.com/) if you haven't already.

The first time you use Heroku, run:

    $ heroku login

If not done in the login step, you may also need to upload a public key with:

    $ heroku keys:add

Form then on, all you have to do to get a new Derby project deployed to Heroku
is initialize it as a Git repo,

    $ git init
    $ git add .
    $ git commit -m "init"

create a Heroku app with access to Redis and MongoDB,

    $ heroku create
    $ heroku addons:add rediscloud:20
    $ heroku addons:add mongohq:sandbox
    $ heroku config:set NODE_ENV=production

and push!

    $ git push heroku master
    $ heroku open

Note that while Derby supports multiple servers, it currently requires that
clients repeatedly connect to the same server. Heroku does not support sticky
sessions or WebSockets, so it isn't possible to use more than one dyno. You'll
have to use a different hosting option to scale your app.

For more info, see Heroku's [Getting Started](https://devcenter.heroku.com/articles/quickstart) and [Node.js](https://devcenter.heroku.com/articles/nodejs) guides.
