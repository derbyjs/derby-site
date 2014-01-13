# Getting started

As with all Node.js modules, first install [Node](http://nodejs.org/#download).
The Node installer will also install [npm](http://npmjs.org/).

Install Derby with:

    $ npm install -g derby

You will also need to install and start [Redis 2.6](http://redis.io/download)
and [MongoDB](http://www.mongodb.org/downloads).

## Create an app

Derby includes a simple project generator:

    $ cd ~
    $ derby new first-project
    $ cd first-project

or, for [CoffeeScript](http://jashkenas.github.com/coffee-script/):

    $ cd ~
    $ derby new --coffee first-project
    $ cd first-project

Then, simply fire up your app:

    $ npm start

## Deploy to Heroku

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

## Using existing data

To make getting started with existing data a bit easier, we've written a [script to initialize the journal](https://github.com/share/igor) in Redis based on a MongoDB database. There is also a [tool to inspect your data](https://github.com/share/godbox) once it is initialized. For more info on using these tools, check out [this video](https://www.youtube.com/watch?v=FoOfNCJkAAA).

## File structure

The default file structure is:

    /lib
      /app
        index.js
      /server
        error.js
        index.js
    /public
    /styles
      /app
        home.styl
        index.styl
        list.styl
      /error
        index.styl
      /ui
        connectionAlert.styl
        index.styl
    /ui
      /connectionAlert
        index.html
        index.js
      index.js
    /views
      /app
        home.html
        index.html
        list.html
      /error
        403.html
        404.html
        500.html
        index.html
    .gitignore
    package.json
    Procfile
    README.md
    server.js

In [CoffeeScript](http://jashkenas.github.com/coffee-script/) projects, script
files are in the `src` directory instead.

Derby uses a filename based convention similar to Node.js modules. A file named
`demo.js` and a directory `demo` containing a file `index.js` both define an
app with the name "demo." The same applies for styles and views, which can
either be `demo.styl` or `demo\index.styl` and `demo.html` or
`demo\index.html`.

Apps are associated with their respective styles and views by filename.
Derby automatically includes them when rendering. Both support importing, so
shared styles and templates may be defined in separate files.

Static files can be placed in the public folder. (Note that the contents of the
public folder map to the root URL, so the image stored at the file
`public/img/logo.png` would be served from the URL `/img/logo.png`.)

The `ui` directory contains a component library, which can be used to create
custom components for the containing project. These are re-usable templates,
scripts, and styles that can be used to create custom HTML tags for use in
applications. General purpose component libraries can be created as separate
npm modules. See [Component Libraries](#component_libraries).