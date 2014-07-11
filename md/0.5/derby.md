# Derby

<p class="promo">MVC framework making it easy to write realtime, collaborative
applications that run in both Node.js and browsers.</p>

<h3 class="javascript">hello.js</h3>
```javascript
var app = require('derby').createApp(module);

// Add template for rendering HTML and model <- -> view bindings
app.view.make('Body',
  'Holler: <input value="{hello.message}"><h1>{hello.message}</h1>'
);

// Add a route, which can render in the browser as well as server
app.get('/', function(page, model) {
  // Specify data to sync
  model.subscribe('hello.message', function() {
    page.render();
  });
});
```

<h3 class="javascript">server.js</h3>
```javascript
var store = require('derby').createStore({
  // Use the mongo adapter to persist data and perform queries
  db: require('livedb-mongo')('localhost:27017/test?auto_reconnect')
  // Keep a journal of all data changes and do PubSub with Redis
, redis: require('redis').createClient()
});

var expressApp = require('express')()
  // Add browserchannel scripts to bundles created by store, and
  // return middleware for responding to remote client messages
  .use(require('racer-browserchannel')(store))
  // Respond to requests for application script bundles
  .use(app.scripts(store))
  // Create models for incoming requests
  .use(store.modelMiddleware())
  // Add the app's routes
  .use(app.router())

require('http').createServer(expressApp).listen(3000);
```

<h3 class="coffeescript">hello.coffee</h3>
```coffeescript
app = require('derby').createApp(module)

# Add template for rendering HTML and model <- -> view bindings
app.view.make 'Body',
  'Holler: <input value="{hello.message}"><h1>{hello.message}</h1>'

# Add a route, which can render in the browser as well as server
app.get '/', (page, model) ->
  # Specify data to sync
  model.subscribe 'hello.message', ->
    page.render()
```

<h3 class="coffeescript">server.coffee</h3>
```coffeescript
store = require('derby').createStore
  # Use the mongo adapter to persist data and perform queries
  db: require('livedb-mongo')('localhost:27017/test?auto_reconnect')
  # Keep a journal of all data changes and do PubSub with Redis
  redis: require('redis').createClient()

expressApp = require('express')()
  # Add browserchannel scripts to bundles created by store, and
  # return middleware for responding to remote client messages
  .use(require('racer-browserchannel')(store))
  # Respond to requests for application script bundles
  .use(app.scripts(store))
  # Create models for incoming requests
  .use(store.modelMiddleware())
  # Add the app's routes
  .use(app.router())

require('http').createServer(expressApp).listen 3000
```

### Add water and...

<iframe src="http://hello.derbyjs.com/" id="hello-iframe" seamless="seamless"> </iframe>

