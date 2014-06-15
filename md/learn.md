## Environment

For Derby you need: [Node](http://nodejs.org) (>=0.10), [MongoDB](http://www.mongodb.org/), [Redis](http://redis.io/) (>=2.6).
If you have all these things, skip this section.

### Debian

Same for all Debian family: Debian, Ubuntu, Mint, etc.
For Node and Redis we will use the chris-lea repository, Mongo has an official repo.

```bash
# Add the repository
# node.js
sudo add-apt-repository -y ppa:chris-lea/node.js
# redis
sudo add-apt-repository -y ppa:chris-lea/redis-server
# mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
sudo echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/10gen.list

# Update the apt-get
sudo apt-get -y update

# Set
sudo apt-get -y install nodejs
sudo apt-get -y install mongodb-10gen
sudo apt-get -y install redis-server
```

### Mac OS

As soon as I buy mac

### Windows

you should compile redis by yourself


## Tool

We certainly can create application from scratch now.
But Derby has tool that generates for us the application layout and saves time. Why do not we use it?
First we need to install derby npm package globally:

```bash
sudo npm install -g derby
```

Let`s create an application called hello-derby (this is also the name of the folder):

```bash
derby bare hello-derby
```

Tool creates the application and installs all dependencies. It will take some time and in the end you will see:

```bash
  Project created!

  Try it out:
    $ Cd hello-derby
    $ Npm start

  More info at: http://derbyjs.com/
```

Bare - means only layout. You can generate simple list-editing app:

```bash
derby new my-list-edit-app
```

We will examine Javascript application, but if you want Coffeescript, use - coffee,-c:

```bash
derby new -coffee my-cool-coffee-derby-app
```

Or create an application, but does not install dependencies using - noinstall,-n:

```bash
derby new -n empty-node_modules-app
```

More options:
```bash
derby --help
```


## Structure

This is `derby new project` structure:

`/lib` - here is almost all js. If you are on the coffee, it will be a folder /src.  
`/lib/app` - this is a client application called 'app'. Here maybe some of them. It runs on client and server.  
`/lib/app/index.js` - here app itself is created, and two component libraries are added: 'derby-ui-boot' (bootstrap for derby) and 'ui' (some components in our Derby app). Then there are routes that will be executed on the server and on the client. At the end controller functions are created - functions that are executed only on the client and are associated with the manipulation of dom.  
`/lib/server` - server application. Can be only one. Code runs only on server and is not directly accessible form client.  
`/lib/server/error.js` - here we generate some custom static (only html and css, without the client application) error pages.  
`/lib/server/index.js` - this creates Express application, configures databases, creates store, adds Connect modules to Express app, some of which are parts of Derby application. At the end it creates a server-side Express route, which generates an error for requests that were not catched by client app router or server (Express) router.  
`/node_modules` - npm packages.  
`/styles` - styles are here. Default engine is Stylus (Less and css are supported also).  
`/styles/app` - styles that will be uploaded to client with client application named 'app'.  
`/styles/ui` - styles for ui component library.  
`/ui` - component library. Each component consists of js and html files.  
`/ui/connectionAlert` - an example of a component. If the client went offline, this component displays the label and button «Reconnect». If reconnect failed, it offers to restart the application «Reload».  
`/ui/index.js` - ui component library settings.  
`/views` - html templates.  
`/views/app` - templates that are loaded into client app.  
`/views/app/home.html` - home page.  
`/views/app/index.html` - layout for home.html and list.html.  
`/views/app/list.html` - list page.  
`/views/error` - templates for the static error pages for /lib/server/error.js  
`.npmignore` - you will need it if you publish your application as a package to npm.  
`Procfile` - this is for Heroku.  
`README.md` - read me  
`package.json` - setting for npm: which modules download on npm install, what to do on npm start, etc.  
`server.js` - main file. The entry point of your application. Derby starts Express application here.


## First Request

Now let`s return to hello-derby and start it:

```bash
cd hello-derby
npm start
```

See:

```bash
1234 listening. Go to: http://localhost:3000/
```

Now in your browser go here: http://localhost:3000/
Can you see a label 'Bare'?  
What just happened? Your request reached server, where it was processed by all Connect middleware from `/lib/server/index.js`, until:

```javascript
.use(app.router())
```

Which is Derby client app router from `app/lib/app/index.js`:

```javascript
app.get('/', function (page) {
  page.render();
});
```

Here for the path '/' we generate html from template `/views/app/index.html`. Why index.html? This is by default. Nothing will change if we change to:

```javascript
app.get('/', function (page) {
  page.render('index');
});
```

In `index.html` we have only section: Body. Also can be: Head, Header, Footer, Scripts, Title, etc. Derby template engine generating html, will find Body section and will put it`s value in the appropriate place, and instead of the other sections (since they are not set), it will put an empty or default values​​. As a result, next html will be returned back to the client:

```html
<! DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title></title>
    <style id="$_css"></style>
  </head>
  <!-$_page->
  <body>
    Bare
    <!-$$_page->
    <script defer="" async="" src="/derby/lib-app-index.js"></script>
  </body>
</html>
```

What can we see ? Title is empty. No styles. Head - also almost empty. As we might expect. And there is something in the body.
All styles from `/styles` folder will be combined, compressed and showed inline. You can put links to css files to Head section (for example) if you want connect style files.
Script `/derby/lib-app-index.js` - is our client application. As soon as it will be loaded to client it will take everything in it's hands. So if you change url, client app router will catch it in browser and Derby template engine will generate html also in browser.
`<!-$_page->` and `<!-$$_page->` - Derby uses html comments like this as internal tags for dynamic binding between data and html. If data changes, only part of html will be regenerated, not entire page. In this case, when router triggered, only Body section will be updated, because we have not set any other section and they all same for all pages.

You can change text in the templates (and styles) and see the changes instantly in your browser. It has no relation to any dynamic data synchronization. This is for the development convenience. If you change the html and css, it will be automatically compiled, uploaded to the client and replaced the old one. If you change js, application restarts.


## Data Binding

Let's separate view from data. For this purpose, there are two ways in Derby. Let's start with Context. This is object, which we can be added as next (after template name) argument in page.render() and the data from which we can display in html.

```javascript
app.get('/', function (page) {
  page.render({text: 'text from Context'});
});
```

```html
<Body:>
  {{text}}
```

Double `{` template brackets mean that html is not dynamically binded to data. Derby template engine does not track html or data changes. It`s not necessary for Context, because Context - just js-object and does not change, therefore usually use-case for Context is static pages. For dynamic app use Model.

Model is data manipulation api-object. Also it stores some state inside itself.  
Where to get the Model? There are many ways (depending on whether you are on the client or on the server), but in the router it goes the second argument (after page) and it is very convenient for us in this situation :

```javascript
app.get('/', function (page, model) {
  page.render();
});
```

Let's put data into Model:

```javascript
app.get('/', function (page, model) {
  model.set('_page.text', 'text in model');
  page.render();
});
```

`_page.text` - this is path in the model, where our text will be stored. Path corresponds to json. In this case :

```javascript
var obj = model.get('_page');
// obj === {text: 'text in model'}
```

Underscore means that this path is local. That is, it exists only in this Model. And is not synchronized with the database and other Models (other clients). You can create any local path, but `_page` object is a little bit special. It cleans every time router is triggered, so it is convenient to store data associated with the page in the `_page` path.  
In order to see the data from the model, change the template:

```html
<Body:>
  {{_page.text}}
```

Let's try to make dynamic binding between data and html:

```html
<Body:>
  <input type="text" value={_page.text} />
  {_page.text}
```

Single brackets `{` mean that the data in the Model is dynamically binded to html. If you change the value in the input, it will change the value in the Model, which in turn changes the text next to the input. That's an example of two-side dynamic binding between data and html.

Well, there was not anything complex? 3 lines of code? It`s not serious?  
Let's make a really serious thing! Now we will create a web application, whose clients are synchronized with each other. We change the html on one client, this dynamically changes the data on the client, then the data flyes to the server, where conflict resolution algorithm merges data to database and send it to all clients that are subscribed to it, finally on each client data will be converted into html. Suitable? How long does it take to write this using your favorite (before Derby) framework? How many lines of code?

```javascript
app.get('/', function (page, model) {
  model.subscribe('page.text', function (err) {
    if (!model.get('page.text')) {
      model.set('page.text', 'text in model');
    }
    page.render();
  });
});
```

```html
<Body:>
  <input type="text" value={page.text} />
  {page.text}
```

That's it? o_O Well, in general, yes. Open http://localhost:3000/ in several browser windows and play with it for a while.

`page.text` - this is remote path. Unlike the local path, it points to the database. In this case, we created `page` collection and object with id `text`. In real life remote paths look like: `users.8ddd02f1-b82d-4a9c-9253-fe5b3b86ef41.name`, `customers.8ddd02f1-b82d-4a9c-9253-fe5b3b86ef41.properties.isLead`, `products.8ddd02f1-b82d-4a9c-9253-fe5b3b86ef41.prices.1.value`.  
`model.subscribe` - this is way we subscribe client for path `page.text`. If any other client will change data in the path `page.text`, server send us new version of data.


## Model Api

Change `/lib/app/index.js` to:

```javascript
app.get('/', function (page, model) {
  model.subscribe('todos', function (err) {
    if (!model.get('todos')) {
      model.add('todos', {text: 'Todo 1' });
      model.add('todos', {text: 'Todo 2' });
    }
    page.render();
  });
});
```

We just subscribed to whole `todos` collection. In the future, all of our data manipulation we be done only after we subscribe Model to some data, because before it Model is empty. Then we added a couple of documents to collection if collection is not exist.  
`model.add` - is a wrapper over `model.set`. The only thing that it does is generate the id itself. We could write:

```javascript
var id = model.id(); // this way guid is generated by using require('node-uuid').v4()
model.set('todos.' + id, {id: id, text: 'Todo 1' });
```

Our collection stored in Model as js-object. If you will do `model.get('todos')`, you get:

```javascript
{
  "e1b8075c-de9a-458a-aa3c-e9b383691521":
    {
      "text": "Todo 1",
      "id": "e1b8075c-de9a-458a-aa3c-e9b383691521"
    },
  "26cd5f4a-c503-4c25-aeeb-a28c8c034d08":
    {
      "text": "Todo 2",
      "id": "26cd5f4a-c503-4c25-aeeb-a28c8c034d08"
    }
}
```

This format (js-object, hash) is good if we want to get documents by id:

```javascript
var todo = model.get('todos.e1b8075c-de9a-458a-aa3c-e9b383691521');
```

But if we want to show list of todos, it`s better to have an array. We can use Filter for this:

```javascript
app.get('/', function (page, model) {
  model.subscribe('todos', function (err) {
    if (!model.get('todos')) {
      model.add('todos', {text: 'Todo 1' });
      model.add('todos', {text: 'Todo 2' });
    }

    var filter = model.filter('todos');
    filter.ref('_page.todos');

    page.render();
  });
});
```

`/views/app/index.html`

```html
<Body:>
  {#each _page.todos as :todo}
    <p>{:todo.text}</p>
  {/}
```

Here we create a Filter for `todos`. It monitors changes to the collection and puts result as array into path `_page.todos` using refList, which will be covered later. But the Filter would not be a Filter , if it not be able to filter. We can do like this:

```javascript
var todosFilteredArray = model.filter('todos', function (todo) {
    return todo.text === 'Todo 1';
}).get();
```

Here we have filtered array immediately. Same as Filter, there is Sort. You can use them separately or together:

```javascript
var todosSortedArray = model.filter('todos').sort(function(a, b) {
  return a.text - b.text;
}).get();
```

Here we have array sorted by `text` field.
Neither Filter, nor Sort knows nothing about your database. They operate only on data that is in the Model.Fill out Model before use them!

What`s with refList? This is references. It allows you to bind data between two paths. Using them directly needed in rarely cases, but they are used internally by Filter and Queries.

```javascript
app.get('/', function (page, model) {
  model.subscribe('todos', function (err) {
    if (!model.get('todos')) {
      model.add('todos', {text: 'Todo 1' });
      model.add('todos', {text: 'Todo 2' });
    }
    
    var ids = Object.keys(model.get('todos'));
    model.set('_page.ids', ids)
    model.refList('_page.todos', 'todos', '_page.ids');

    page.render();
  });
});
```

`ids` - a list of ids of those todos, we want to have in result. They also set the order of the array in `_page.todos`. We can change `_page.ids` and it is immediately reflected on the `_page.todos`.

Let play with subscribe:

```javascript
model.subscribe('todos', function (err) {
    // Subscribe to the entire collection of todos
});
model.subscribe('todos.e1b8075c-de9a-458a-aa3c-e9b383691521', function (err) {
    // Subscribe to one document
});
model.subscribe('todos.e1b8075c-de9a-458a-aa3c-e9b383691521.text', function (err) {
    // Subscribed to one field of one document
});
model.subscribe('users', 'todos.e1b8075c-de9a-458a-aa3c-e9b383691521.text', function (err) {
    // You can combine to not produce extra callbacks
});
```

Lets suppose we are very busy people and we have a million todos. And we want to subscribe to only those whose text contains certain characters. Why do we need to upload entire collection to the client? Paths and Filter will not help us in this sutiation. It`s time for Queries:

```javascript
app.get ('/', function (page, model) {
  var query = model.query('todos', {text: 'Todo 1'});
  model.subscribe(query, function (err) {
    if (!model.get('todos')) {
      model.add('todos', {text: 'Todo 1' });
      model.add('todos', {text: 'Todo 2' });
    }

    query.ref('_page.todos');

    page.render();
  });
});
```

Here we create Query, subscribe Model to it and puts results as array to `_page.todos`.  
`{text: 'Todo 1'}` - is Mongo Queries. livedb-mongo adapter transfers this object directly to Mongo. For other databases, you can write your own adapters and make it different way.

## Getting started

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