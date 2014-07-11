# Introduction

Derby includes a powerful data synchronization engine called
[Racer](http://racerjs.com/). While it works differently, Racer is to Derby
somewhat like ActiveRecord is to Rails. Racer automatically syncs data between
browsers, servers, and a database. Models subscribe to changes on specific
objects and queries, enabling granular control of data propagation without
defining channels. Racer supports conflict resolution out of the box, which
greatly simplifies writing multi-user applications.

On top of Racer, Derby provides powerful templating, data binding, and routing
features. Every feature of Racer and Derby is written with server and client
rendering in mind. Derby makes it simple to write applications that load as fast
as a search engine, are as interactive as a document editor, and work offline.

## Features

* **Realtime collaboration:** Powered by [ShareJS's](http://sharejs.org/)
  operational transformation of JSON and text, all conflicting data changes are
  automatically resolved. By default, every text input is a collaborative text
  editor, and every bit of data in the model can be collaboratively edited in
  realtime or offline.

* **Client and server routing:** The same routes produce a single-page browser
  app and an [Express](http://expressjs.com/) server app. Links render
  instantly with push/pop state changes in modern browsers, while server
  rendering provides access to search engines and browsers without JavaScript.

* **HTML templates:** [Handlebars](http://handlebarsjs.com/)-like templates are
  rendered into HTML on both the server and client. Because they render on the
  server, pages display immediately---even before any scripts are downloaded.
  Templates are mostly just HTML, so designers can understand and modify them.

* **View bindings:** In addition to HTML rendering, templates specify live
  bindings between the view and model. When model data change, the view updates
  the properties, text, or HTML necessary to reflect the new data. When
  users interact with the page---such as editing the value of a text
  input---the model data update.

## Why not use Rails and Backbone?

Derby represents a new breed of application frameworks, which we believe will
replace currently popular libraries like [Rails](http://rubyonrails.org/) and
[Backbone](http://documentcloud.github.com/backbone/).

Adding dynamic features to apps written with [Rails](http://rubyonrails.org/),
[Django](https://www.djangoproject.com/), and other server-side frameworks
tends to produce a tangled mess. Server code renders various initial states
while jQuery selectors and callbacks desperately attempt to make sense of the
DOM and user events. Adding new features typically involves changing both
server and client code, often in different languages.

Many developers now include a client MVC framework like
[Backbone](http://documentcloud.github.com/backbone/) to better structure
client code. A few have started to use declarative model-view binding
libraries, such as [Knockout](http://knockoutjs.com/) and
[Angular](http://angularjs.org/), to reduce boilerplate DOM manipulation and
event bindings. These are great concepts, and adding some structure certainly
improves client code. However, they still lead to duplicating rendering code
and manually synchronizing changes in increasingly complex server and client
code bases. Not only that, each of these pieces must be manually wired together
and packaged for the client.

Derby radically simplifies this process of adding dynamic interactions. It runs
the same code in servers and browsers, and it syncs data automatically. Derby
takes care of template rendering, packaging, and model-view bindings out of the
box. Since all features are designed to work together, no code duplication and
glue code are needed. Derby equips developers for a future when all data in all
apps are realtime.

## Flexibility without the glue code

Derby eliminates the tedium of wiring together a server, server templating
engine, CSS compiler, script packager, minifier, client MVC framework, client
JavaScript library, client templating and/or bindings engine, client history
library, realtime transport, ORM, and database. It eliminates the complexity of
keeping state synchronized among models and views, clients and servers,
multiple windows, multiple users, and models and databases.

At the same time, it plays well with others. Derby follows the conventions of
[Node.js](http://nodejs.org/), and it is built on top of popular
libraries, including [Express](http://expressjs.com/),
[Browserify](https://github.com/substack/node-browserify),
[Google's BrowserChannel](https://github.com/josephg/node-browserchannel),
[Stylus](http://learnboost.github.com/stylus/docs/iteration.html),
[LESS](http://lesscss.org/), [UglifyJS](https://github.com/mishoo/UglifyJS),
[Redis](http://redis.io/), [MongoDB](http://www.mongodb.org/), and soon other
popular socket libraries and databases. The model engine
[Racer](http://racerjs.com/) as well as the underlying data syncing module
[ShareJS](http://sharejs.org/)
and the underlying can be used separately. Other client
libraries, such as jQuery, and any Node.js module from npm work just as well
along with Derby.

When following the default file structure, templates, styles, and scripts are
automatically packaged and included in the appropriate pages.

## Performance

Derby is architected with speed in mind.

Client-only application frameworks have dramatically slower page loads. Even an extremely optimized client-only renderer causes the browser to wait for the page to load a script (most likely via an additional request), interpret the script, render the template, and update the DOM before it has a chance to start performing layout of the HTML content.

Derby's architecture optimizes time to load the page initially, to re-render sections or the entire page client-side, and to update individual elements in realtime.

## Demos

See [source and installation instructions](https://github.com/codeparty/derby-examples) for the demos

### Chat

[http://chat.derbyjs.com/lobby](http://chat.derbyjs.com/lobby)

A simple chat demo. Note that as you edit your name, it updates in realtime.
Name changes also show up in the page title and other rooms. Check out the
source in the examples directory to see how these bindings are created
automatically.

### Todos

[http://todos.derbyjs.com/derby](http://todos.derbyjs.com/derby)

The requisite MVC demo, but collaborative and realtime!

### Directory

[http://directory.derbyjs.com/](http://directory.derbyjs.com/)

A simple example of an application with multiple pages.

### Sink

[http://sink.derbyjs.com/](http://sink.derbyjs.com/)

A kitchen-sink style example with random features. Largely used for testing.

### Widgets

[http://widgets.derbyjs.com/](http://widgets.derbyjs.com/)

Test of the components in the [Boot](https://github.com/codeparty/derby-ui-boot/) component library.

## Disclaimer

Derby and Racer are beta software. Racer has recently been rewritten to
scale on the backend and to properly cleanup memory in complex applications
with many pages. Derby is being used in production, but it is still undergoing
major development and will have rough edges. APIs are subject to change.

If you have feedback, ideas, or suggestions, please email the [Google
Group](http://groups.google.com/group/derbyjs). If you are interested in
contributing, please reach out to [Nate](https://github.com/nateps),
[Brian](https://github.com/bnoguchi), and [Joseph](https://github.com/josephg).