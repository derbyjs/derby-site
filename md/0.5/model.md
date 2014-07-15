## Models

Derby models are powered by [Racer](http://racerjs.com/), a realtime model synchronization engine. Racer enables multiple users to interact with the same data objects via sophisticated conflict detection and resolution algorithms. At the same time, it provides a simple object accessor and event interface for writing application logic.

## Introduction to Racer

On the server, Racer creates a `store`, which manages data updates. Stores create `model` objects, which provide a synchronous interface similar to interacting directly with objects. Models maintain their own copy of a subset of the global state. This subset is defined via [subscriptions](#subscription) to certain paths. Models perform operations independently, and they automatically synchronize their state with the associated store.

All remotely synced data is stored via [ShareJS](http://sharejs.org/), which means that different clients can modify the same data at the same time. ShareJS uses [Operational Transformation (OT)](http://en.wikipedia.org/wiki/Operational_transformation) to automatically resolve conflicts and update the view for each client.

Model [mutator methods](#getters_and_setters) provide callbacks invoked after the server ultimately commits an operation. These callbacks can be used to wait for the eventual value of an operation before performing further logic, such as waiting for an increment to get a unique count number. Models also emit events when their contents are updated, which Derby uses to update the view in realtime.

## Creating stores

The default server produced by the Derby project generator will create a store and add a modelMiddleware to the Express server before any app routers. The modelMiddleware adds a `req.getModel()` function which can be called to create or get a model (if one was already created) for a given request.

> ### `store = `derby.createStore` ( options )`
>
> **options:** An object that configures the store
>
> **store:** Returns a Racer store object

Typically, a project will have only one store, even if it has multiple apps. It is possible to have multiple stores, though a given page can only have one model, and a model is associated with one store.

### Persistence

Racer stores are backed by ShareJS, which uses [LiveDB](https://github.com/share/livedb) to keep a journal of all operations in Redis, perform PubSub of operations and queries, and store data via a snapshot database wrapper. Currently, LiveDB only supports PubSub via Redis, and the only available database adapter is [livedb-mongo](https://github.com/share/livedb-mongo) for MongoDB. The database adapters are very simple, and writing additional database adapters is straightforward.

Note that LiveDB requires at least Redis 2.6, since it uses Lua scripting to perform journal operations.

See the [MongoSkin](https://github.com/kissjs/node-mongoskin#module) and [Node.js Redis client](https://github.com/mranney/node_redis#rediscreateclientport-host-options) documentation for configuration options.

```javascript
var liveDbMongo = require('livedb-mongo');
var redis = require('redis').createClient();

var mongoUrl = 'mongodb://localhost:27017/database?auto_reconnect';
var store = app.createStore({
  // Arguments are the same as those for MongoSkin
  db: liveDbMongo(mongoUrl, {safe: true})
, redis: redis
});
```
```coffeescript
liveDbMongo = require('livedb-mongo');
redis = require('redis').createClient();

mongoUrl = 'mongodb://localhost:27017/database?auto_reconnect'
store = app.createStore
  # Arguments are the same as those for MongoSkin
  db: liveDbMongo(mongoUrl, {safe: true})
  redis: redis
```

Racer paths are translated into database collections and documents using a natural mapping:

    collection.documentId.documentProperty

LiveDB Mongo will add `_type`, and `_v` properties to Mongo documents for internal use. It will strip out these properties as well as `_id` when it returns the document from Mongo. If a document is an object, it will be stored as the Mongo document directly. If it is another type, it will be nested under a property on the Mongo document caleld `_data`.

It is not possible to set or drop an entire collection, or get the list of collections via the Racer API.

## Creating models

Derby provides a model when calling application routes. On the server, it creates an empty model from the `store` associated with an app. When the server renders the page, the model is serialized. It is then reinitialized into the same state on the client. This model object is passed to app routes rendered on the client.

Derby uses the model supplied by the store.modelMiddleware by calling `req.getModel()`. To pass data from server-side express middleware or routes, the model can be retrieved via this same method and data can be set on it before passing control to the app router. Model's created from `req.getModel()` specify the option `{fetchOnly: true}`. This means that calls to `model.subscribe()` actually only fetch data and don't subscribe. This is more efficient during server-side rendering, since the model is only created for long enough to handle the route and render the page. The model then gets subscribed when it initializes in the browser.

If you would like to get or set data outside of the app on the server, you can create models directly via `store.createModel()`.

> ### `model = `store.createModel` ( options )`
>
> **model:** A Racer model object associated with the given store

## Model features

### Paths

All model operations happen on paths which represent nested JSON objects. These paths must be globally unique within a particular database and Redis journal.

For example, the model:

    {
      title: 'Fruit store',
      fruits: [
        { name: 'banana', color: 'yellow' },
        { name: 'apple', color: 'red' },
        { name: 'lime', color: 'green' }
      ]
    }

Would have paths like `title`, `fruits.1`, and `fruits.0.color`. Any path segment that is a number must be an index of an array.

**WARNING:** If you want to use an id value that is a number as a path segment, be careful to prefix this with another character, such as `_` before setting it. Otherwise, you will accidentally create a gigantic array and probably run out of memory. For example, use a path like: `items._1239182389123.name` and never `items.1239182389123.name`.

#### Local and remote collections

Collection names (i.e. the first path segment) that start with an underscore (`_`) or dollar sign (`$`) are local to a given model and are not synced. All paths that start with another character are remote, and will be synced to servers and other clients via ShareJS. Collections that begin with dollar signs are reserved for use by Racer, Derby, or extensions, and should not be used for application data.

Almost all non-synced data within an application should be stored underneath the `_page` local collection. This enables Derby to automatically cleanup as the user navigates between pages. Right before rendering a new page, Derby calls `model.destroy('_page')`, which removes all data, references, event listeners, and reactive functions underneath the `_page` collection. If you have some data that you would like to be maintained between page renders, it can be stored underneath a different local collection. This is useful for setting data on the server, such as setting `_session.userId` in authentication code. However, be very careful when storing local data outside of `_page`, since bleeding state between pages is likely to be a source of unexpected bugs.

#### Scoped models

Scoped models provide a more convenient way to interact with commonly used paths. They support the same methods, and they provide the path argument to accessors, mutators, event methods, and subscription methods. Also, wherever a path is accepted in a racer method, a scoped model can typically be used as well.

> ### `scoped = `model.at` ( subpath )`
>
> **subpath:** The relative reference path to set. The path is appended if called on a scoped model
>
> **scoped:** Returns a scoped model

> ### `scoped = `model.scope` ( [path] )`
>
> **path:** The absolute reference path to set. This will become the scope even if called on a scoped model. May be called without a path to get a model scoped to the root
>
> **scoped:** Returns a scoped model

> ### `scoped = `model.parent` ( [levels] )`
>
> **levels:** *(optional)* Defaults to 1. The number of path segments to remove from the end of the reference path
>
> **scoped:** Returns a scoped model

> ### `path = `model.path` ( [subpath] )`
>
> **subpath:** A relative reference path to append
>
> **path:** Returns the reference path

> ### `segment = `model.leaf` ( )`
>
> **segment:** Returns the last segment for the reference path. Useful for getting indices, ids, or other properties set at the end of a path

```javascript
room = model.at('_page.room');

// These are equivalent:
room.at('name').set('Fun room');
room.set('name', 'Fun room');

// Logs: {name: 'Fun room'}
console.log(room.get());
// Logs: 'Fun room'
console.log(room.get('name'));
```
```coffeescript
room = model.at '_page.room'

# These are equivalent:
room.at('name').set 'Fun room'
room.set 'name', 'Fun room'

# Logs: {name: 'Fun room'}
console.log room.get()
# Logs: 'Fun room'
console.log room.get('name')
```

Note that Derby also extends `model.at` to accept a DOM node as an argument. This is typically used with `e.target` in an event callback. See [x-bind](#dom_event_binding).

#### GUIDs

Models provide a method to create globally unique ids. These can be used as part of a path or within mutator methods.

> ### `guid = `model.id` ( )`
>
> **guid:** Returns a globally unique identifier that can be used for model operations

### Queries

Racer can fetch or subscribe to queries based on a model value or a database-specific query. When fetching or subscribing to a query, all of the documents associated with that query are also fetched or subscribed.

> ### `query = `model.query` ( collectionName, path )`
>
> **collectionName:** The name of a collection from which to get documents
>
> **path:** A model path whose value contains a documentId or an array of documentIds

> ### `query = `model.query` ( collectionName, databaseQuery )`
>
> **collectionName:** The name of a collection from which to get documents
>
> **databaseQuery:** A query in the database native format, such as a MonogDB query

The `livedb-mongo` adapter supports most MongoDB queries that you could pass to the Mongo `find()` method. See the [Mongo DB query documentation](http://docs.mongodb.org/manual/core/read-operations/#read-operations-query-document) and the [query selectors reference](http://docs.mongodb.org/manual/reference/operator/#query-selectors). Note that projections are not supported; only full documents may be returned. Also, cursor methods are not directly available, so `$orderby` should be used for sorting, and skips and limits should be specified as `$skip` and `$limit`. There is currently no `findOne()` equivalent&mdash;Use `$limit: 1` instead.

After a query is subscribed or fetched, its results can be returned directly via `query.get()`. It is also possible to to create a live-updating results set in the model via `query.ref()`.

> ### `results = `query.get` ( )`
>
> **results:** Creates and returns an array of each of the document objects matching the query

> ### `scoped = `query.ref` ( path )`
>
> **path:** Local path at which to create an updating refList of the queries results
>
> **scoped:** Returns a model scoped to the path at which results are output

### Subscriptions

The `subscribe`, `fetch`, `unsubscribe`, and `unfetch` methods are used to load and unload data from a model. These methods don't return data directly. Rather, they load the data into the model. The data are then accessed via model getter methods.

`subscribe` and `fetch` both return data initially, but subscribe also registers with PubSub on the server to receive ongoing updates as the data change.

> ### model.subscribe` ( items..., callback(err) )`
> ### model.fetch` ( items..., callback(err) )`
> ### model.unsubscribe` ( items..., callback(err) )`
> ### model.unfetch` ( items..., callback(err) )`
>
> **items:** Accepts one or more subscribable items, including a path, scoped model, or query
>
> **callback:** Calls back once all of the data for each query and document has been loaded or when an error is encountered

Avoid subscribing or fetching queries by document id like `model.query('users', {_id: xxx})`. You can achieve the same result passing `'users.xxx'` or `model.at('users.xxx')` to subscribe or fetch, and it is much more efficient.

If you only have one argument in your call to subscribe or fetch, you can also call `subscribe`, `fetch`, `unsubscribe`, and `unfetch` on the query or scoped model directly.

```javascript
var user = model.at('users.' + userId);
user.subscribe(function(err) {
  if (err) return next(err);
  var todosQuery = model.query('todos', {creatorId: userId});
  todosQuery.subscribe(function(err) {
    if (err) return next(err);
    model.ref('_page.user', user);
    todosQuery.ref('_page.todosList');
    page.render();
  });
});
```
```coffeescript
user = model.at 'users.' + userId
user.subscribe (err) ->
  return next err if err
  todosQuery = model.query 'todos', {creatorId: userId}
  todosQuery.subscribe (err) ->
    return next err if err
    model.ref '_page.user', user
    todosQuery.ref '_page.todosList'
    page.render()
```

Racer internally keeps track of the context in which you call subscribe or fetch, and it counts the number of times that each item is subscribed or fetched. To actually unload a document from the model, you must call the unsubscribe method the same number of times that subscribe is called and the unfetch method the same number of times that fetch is called. However, you generally don't need to worry about calling unsubscribe and unfetch manually.

Instead, the `model.unload()` method can be called to unsubscribe and unfetch from all of the subscribes and fetches performed since the last call to unload. Derby calls this method on every full page render right before entering a route. By default, the actual unsusbscribe and unfetch happens after a short delay, so if something gets resubscribed during routing, the item will never end up getting unsubscribed and it will callback immediately.

### References

References make it possible to write business logic and templates that interact with the model in a general way. They redirect model operations from a reference path to the underlying data, and they set up event listeners that emit model events on both the reference and the actual object's path.

References must be declared per model, since calling `model.ref` creates a number of event listeners in addition to setting a ref object in the model. When a reference is created or removed, a `change` model event is emitted. References are not actually stored in the model data, but they can be used from getter and setter methods as if they are.

> ### `scoped = `model.ref` ( path, to, [options] )`
>
> **path:** The location at which to create a reference. This must be underneath a [local collection](#local_and_remote_collections) (typically `_page`), since references must be declared per model
>
> **to:** The location that the reference links to. This is where the data is actually stored
>
> **options:** An options object. Supports the option `{updateIndices: true}`, which will update the ref's `to` path if it contains array indices whose parents are modified via array inserts, removes, or moves
>
> **scoped:** Returns a model scoped to the output path for convenience

> ### model.removeRef` ( path )`
>
> **path:** The location at which to remove the reference

```javascript
model.set('colors', {
  red: {hex: '#f00'}
, green: {hex: '#0f0'}
, blue: {hex: '#00f'}
});

// Getting a reference returns the referenced data
model.ref('_page.green', 'colors.green');
// Logs {hex: '#0f0'}
console.log(model.get('_page.green'));

// Setting a property of the reference path modifies
// the underlying data
model.set('_page.green.rgb', [0, 255, 0]);
// Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log(model.get('colors.green'));

// Removing the reference has no effect on the underlying data
model.removeRef('_page.green');
// Logs undefined
console.log(model.get('_page.green'));
// Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log(model.get('colors.green'));
```
```coffeescript
model.set 'colors'
  red: {hex: '#f00'}
  green: {hex: '#0f0'}
  blue: {hex: '#00f'}

# Getting a reference returns the referenced data
model.ref '_page.green', 'colors.green'
# Logs {hex: '#0f0'}
console.log model.get('_page.green')

# Setting a property of the reference path modifies
# the underlying data
model.set '_page.green.rgb', [0, 255, 0]
# Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log model.get('colors.green')

# Removing the reference has no effect on the underlying data
model.removeRef '_page.green'
# Logs undefined
console.log model.get('_page.green')
# Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log model.get('colors.green')
```

Racer also supports a special reference type created via `model.refList`. This type of reference is useful when a number of objects need to be rendered or manipulated as a list even though they are stored as properties of another object. This is also type of reference created by a query. A reference list supports the same mutator methods as an array, so it can be bound in a view template just like an array.

> ### `scoped = `model.refList` ( path, collection, ids, [options] )`
>
> **path:** The location at which to create a reference list. This must be underneath a [local collection](#local_and_remote_collections) (typically `_page`), since references must be declared per model
>
> **collection:** The path of an object that has properties to be mapped onto an array. Each property must be an object with a unique `id` property of the same value
>
> **ids:** A path whose value is an array of ids that map the `collection` object's properties to a given order
>
> **options:** An options object. Supports the option `{deleteRemoved: true}`, which will delete objects from the `collection` path if the corresponding item is removed from the refList's output path
>
> **scoped:** Returns a model scoped to the output path for convenience

> ### model.removeRefList` ( path )`
>
> **path:** The location at which to remove the reference

Note that if objects are inserted into a refList without an `id` property, a unique id from [`model.id()`](#guids) will be automatically added to the object.

```javascript
// refLists should consist of objects with an id matching
// their property on their parent
model.setEach('colors', {
  red: {hex: '#f00', id: 'red'},
  green: {hex: '#0f0', id: 'green'},
  blue: {hex: '#00f', id: 'blue'}
});
model.set('_page.colorIds', ['blue', 'red']);
model.refList('_page.myColors', 'colors', '_page.colorIds');

model.push('_page.myColors', {hex: '#ff0', id: 'yellow'});

// Logs: [
//   {hex: '#00f', id: 'blue'},
//   {hex: '#f00', id: 'red'},
//   {hex: '#ff0', id: 'yellow'}
// ]
console.log(model.get('_page.myColors'));
```
```coffeescript
# refLists should consist of objects with an id matching
# their property on their parent
model.setEach 'colors',
  red: {hex: '#f00', id: 'red'}
  green: {hex: '#0f0', id: 'green'}
  blue: {hex: '#00f', id: 'blue'}
model.set '_page.colorIds', ['blue', 'red']
model.refList '_page.myColors', 'colors', '_page.colorIds'

model.push '_page.myColors', {hex: '#ff0', id: 'yellow'}

# Logs: [
#   {hex: '#00f', id: 'blue'},
#   {hex: '#f00', id: 'red'},
#   {hex: '#ff0', id: 'yellow'}
# ]
console.log model.get('_page.myColors')
```

When a collection is cleaned up by `model.destroy()`, the `model.removeAllRefs()` method is invoked to remove all refs and refLists underneath the collection.

> ### model.removeAllRefs` ( from )`
>
> **from:** Path underneath which to remove all refs and refLists

It isn't neccessary to manually dereference model paths, but for debugging, testing, or special cases there is a `model.dereference()` method.

> ### `resolved = `model.dereference` ( from )`
>
> **from:** Path to dereference
>
> **resolved:** Returns the fully dereferenced path, possibly passing through multiple refs or refLists. Will return the input path if no references are found

### Getters and setters

Model mutator methods are applied optimistically. This means that changes are reflected immediately, but they may ultimately fail or be transformed to something else after being sent to the server. All model mutator methods are synchronous and provide an optional callback.

#### Basic methods

These methods can be used on any model path to get, set, or delete an object.

Models allow getting and setting to nested undefined paths. Getting such a path returns `undefined`. Setting such a path first sets each undefined or null parent to an empty object or empty array. Whether or not an implied parent is a created as an object or array is determined by whether the path segment is a number.

```javascript
var model = store.createModel();
model.set('cars.DeLorean.DMC12.color', 'silver');
// Logs: { cars: { DeLorean: { DMC12: { color: 'silver' }}}}
console.log(model.get());
```
```coffeescript
model = store.createModel()
model.set 'cars.DeLorean.DMC12.color', 'silver'
# Logs: { cars: { DeLorean: { DMC12: { color: 'silver' }}}}
console.log model.get()
```

> ### `value = `model.get` ( [path] )`
>
> **path:** *(optional)* Path of object to get. Not supplying a path will return all data in the model
>
> **value:** Current value of the object at the given path. Note that objects are returned by reference and should not be modified directly

All model mutators have an optional callback with an error argument `callback(err)`.

> ### `previous = `model.set` ( path, value, [callback] )`
>
> **path:** Model path to set
>
> **value:** Value to assign
>
> **previous:** Returns the value that was set at the path previously
>
> **callback:** *(optional)* Invoked upon completion of a successful or failed operation

> ### `obj = `model.del` ( path, [callback] )`
>
> **path:** Model path of object to delete
>
> **obj:** Returns the deleted object

> ### `obj = `model.setNull` ( path, value, [callback] )`
>
> **path:** Model path to set
>
> **value:** Value to assign only if the path is null or undefined
>
> **obj:** Returns the object at the path if it is not null or undefined. Otherwise, returns the new value

> ### model.setEach` ( path, object, [callback] )`
>
> **path:** Model path underneath which each property will be set
>
> **object:** An object whose properties are each set individually

> ### model.setDiff` ( path, value, [options], [callback] )`
>
> **path:** Model path to set
>
> **value:** Value, which will be deep traversed, setting each property that is different or performing array methods to make the values the same. Will do nothing if the values are equal already. May end up performing zero or many mutations
>
> **options:** An `equal` property may be passed to specify a custom equality function

> ### `num = `model.increment` ( path, [byNum], [callback] )`
>
> **path:** Model path to set
>
> **byNum:** *(optional)* Number specifying amount to increment or decrement if negative. Defaults to 1
>
> **num:** Returns the new value that was set after incrementing

> ### `id = `model.add` ( path, object, [callback] )`
>
> **path:** Model path to set
>
> **object:** A document to add. If the document has an `id` property, it will be set at that value underneath the path. Otherwise, an id from `model.id()` will be set on the object first
>
> **id:** Returns `object.id`

#### Array methods

Array methods can only be used on paths set to arrays, null, or undefined. If the path is null or undefined, the path will first be set to an empty array before applying the method.

> ### `length = `model.push` ( path, value, [callback] )`
>
> **path:** Model path to an array
>
> **value:** An item to add to the *end* of the array
>
> **length:** Returns the length of the array with the new item added

> ### `length = `model.unshift` ( path, value, [callback] )`
>
> **path:** Model path to an array
>
> **value:** An item to add to the *beginning* of the array
>
> **length:** Returns the length of the array with the new item added

> ### `length = `model.insert` ( path, index, values, [callback] )`
>
> **path:** Model path to an array
>
> **index:** Index at which to start inserting. This can also be specified by appending it to the path instead of as a separate argument
>
> **values:** An array of items to insert at the index
>
> **length:** Returns the length of the array with the new items added

> ### `item = `model.pop` ( path, [callback] )`
>
> **path:** Model path to an array
>
> **item:** Removes the last item in the array and returns it

> ### `item = `model.shift` ( path, [callback] )`
>
> **path:** Model path to an array
>
> **item:** Removes the first item in the array and returns it

> ### `removed = `model.remove` ( path, index, [howMany], [callback] )`
>
> **path:** Model path to an array
>
> **index:** Index at which to start removing items
>
> **howMany:** *(optional)* Number of items to remove. Defaults to 1
>
> **removed:** Returns an array of removed items

> ### `moved = `model.move` ( path, from, to, [howMany], [callback] )`
>
> **path:** Model path to an array
>
> **from:** Starting index of the item to move
>
> **to:** New index where the item should be moved
>
> **howMany:** *(optional)* Number of items to move. Defaults to 1
>
> **moved:** Returns an arry of items that were moved

#### String methods

String methods can only be used on paths set to strings, null, or undefined. If the path is null or undefined, the path will first be set to an empty string before applying the method.

The string methods support collaborative text editing, and Derby uses string methods to bind changes to all text inputs and textareas by default.

> ### model.stringInsert` ( path, index, text, [callback] )`
>
> **path:** Model path to a string
>
> **index:** Character index within the string at which to insert
>
> **text:** String to insert

> ### model.stringRemove` ( path, index, howMany, [callback] )`
>
> **path:** Model path to a string
>
> **index:** Starting character index of the string at which to remove
>
> **howMany:** Number of characters to remove

### Events

Models inherit from the standard [Node.js EventEmitter](http://nodejs.org/docs/latest/api/events.html), and they support the same methods: `on`, `once`, `removeListener`, `emit`, etc.

#### Model mutator events

Racer emits events whenever it mutates data via `model.set`, `model.push`, etc. It also emits events when data is remotely updated via a subscription. These events provide an entry point for an app to react to a specific data mutation or pattern of data mutations. The events might not be exactly the same as the methods that created them, since they can be transformed via OT.

`model.on` and `model.once` accept a second argument for these types of events. The second argument is a path pattern that will filter emitted events, calling the handler function only when a mutator matches the pattern. Path patterns support a single segment wildcard (`*`) anywhere in a path, and a multi-segment wildcard (`**`) at the end of the path. The multi-segment wildcard alone (`'**'`) matches all paths.

> ### `listener = `model.on` ( method, path, eventCallback )`
>
> **method:** Name of the mutator method: `'change'`, `'insert'`, `'remove'`, `'move'`, `'stringInsert'`, `'stringRemove'`, `'load'`, `'unload'`, or `'all'`
>
> **path:** Pattern matching the path being mutated. For example: `'_page.user'`, `'users.*.name'`, `'users.*'`, `'users.**'`, `'users**'`, or `'**'`
>
> **eventCallback:** Function to call when a matching method and path are mutated
>
> **listener:** Returns the listener function subscribed to the event emitter. This is the function that should be passed to `model.removeListener`

The event callback receives a number of arguments based on the path pattern and method. The arguments are:

> ### eventCallback` ( captures..., [event], args..., passed )`
>
> **captures:** The path segment or segments that match the wildcards in the path pattern
>
> **event:** The `'all'` event adds the emitted event name after the captures and before the args
>
> **args:** Event specific arguments. See below
>
> **passed:** An object with properties provided via `model.pass`. See description below

#### Model mutator event arguments

> ### changeEvent` ( captures..., value, previous, passed )`
>
> **value:** The current value at the path that was changed. Will be `undefined` for objects that were deleted
>
> **previous:** The previous value at the path. Will be `undefined` for paths set for the first time

> ### insertEvent` ( captures..., index, values, passed )`
>
> **index:** The index at which items were inserted
>
> **values:** An array of values that were inserted. Always an array, even if only one item was pushed, unshifted, or inserted

> ### removeEvent` ( captures..., index, removed, passed )`
>
> **value:** The current value at the path that was changed. Will be `undefined` for objects that were deleted
>
> **removed:** An array of values that were removed. Always an array, even if only one item was popped, shifted, or removed

> ### moveEvent` ( captures..., from, to, howMany, passed )`
>
> **from:** The index from which items were moved
>
> **to:** The index to which items were moved
>
> **howMany:** How many items were moved

> ### stringInsertEvent` ( captures..., index, text, passed )`
>
> **index:** The character index within the string at which text was inserted
>
> **text:** The string that was inserted

> ### stringRemoveEvent` ( captures..., index, howMany, passed )`
>
> **index:** The index within the string at which characters were removed
>
> **howMany:** How many characters were removed

> ### loadEvent` ( captures..., document, passed )`
>
> **document:** This event fires when a document is loaded via a subscription or fetch. It emits the value of the newly loaded document object

> ### unloadEvent` ( captures..., previousDocument, passed )`
>
> **previousDocument:** This event fires when a document is removed from the model via unsubscribe or unfetch. It emits the value of the document object that was unloaded

Note that `stringInsert` and `stringRemove` events are also emitted as `change` to make handling any change to a string value easier. The change event is passed a parameter of `{$original: 'stringInsert'}` or `{$original: 'stringRemove'}`, in case handling the original event and ignoring the change event is preferred.

```javascript
// Matches model.push('messages', message)
model.on('insert', 'messages', function (index, [message]) {
  ...
});

// Matches model.set('todos.4.completed', true), etc.
model.on('change', 'todos.*.completed', function (todoId, isComplete) {
  ...
});

// Matches all events
model.on('all', '**', function (path, event, args...) {
  ...
});
```
```coffeescript
# Matches model.push('messages', message)
model.on 'insert', 'messages', (index, [message]) ->
  ...

# Matches model.set('todos.4.completed', true), etc.
model.on 'set', 'todos.*.completed', (todoId, isComplete) ->
  ...

# Matches all set operations
model.on 'all', '**', (path, event, args...) ->
  ...
```

#### model.pass

This method can be chained before calling a mutator method to pass an argument to model event listeners. You must pass it an object with a property that identifies the name of the parameter.

This value is only passed to local listeners, and it is not sent to the server or other clients. It is typically used to identify the originator of a particular mutation so that multiple responses to the same change and infinite loops may be avoided. Such loops could occur for listeners that respond to paths that they may modify.

```javascript
// Logs:
//   'red', {}
//   'green', {message: 'hi'}

model.on('change', 'color', function (value, previous, passed) {
  console.log(value, passed);
});
model.set('color', 'red');
model.pass({message: 'hi'}).set('color', 'green');
```
```coffeescript
# Logs:
#   'red', {}
#   'green', {message: 'hi'}

model.on 'change', 'color', (value, previous, passed) ->
  console.log value, passed
model.set 'color', 'red'
model.pass({message: 'hi'}).set 'color', 'green'
```

### Filters and sorts

Filters create a live-updating list from items in an object or another list. They provide an interface similar to the array.filter and array.sort methods of Javascript, but the results automatically update as the input items change.

> ### `filter = `model.filter` ( inputPath, [name] )`
>
> **inputPath:** A path pointing to an object or array. The path's values will be retrieved from the model via `model.get()`, and then each item will be checked against the filter function
>
> **name:** *(optional)* The name of the function defined via `model.fn()`. May instead be a function itself. The function should have the arguments `function(item, key, object)` for collections and objects, and `function(item, index, array)` for arrays. Like functions for [array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), the function should return true for values that match the filter

If `model.filter` is called without a filter function, it will create a list out of all items in the input object. This can be handy as a way to render all subscribed items in a collection, since only arrays can be used as an input to `{#each}` template tags.

> ### `filter = `model.sort` ( inputPath, [name] )`
>
> **inputPath:** A path pointing to an object or array. The path's values will be retrieved from the model via `model.get()`, and then each item will be checked against the filter function
>
> **name:** *(optional)* The name of the function defined via `model.fn()`. May instead be a function itself. The function should should be a compare function with the arguments `function(a, b)`. It should return the same values as compare functions for [array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

There are two default named functions defined for sorting, `asc` and `desc`. If sort is called without a function name, it defaults to using the `asc` function. These functions compare each item with Javascript's less than and greater than operators. See MDN for more info on [sorting non-ASCII characters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Sorting_non-ASCII_characters).

You define functions to be used in `model.filter` and `model.sort` via [`model.fn`](#modelfn). See the next section for more info.

A filter may have both a filter function and a sort function by chaining the two calls:

```javascript
app.on('model', function(model) {
  model.fn('expensiveItem', function(item) {
    return item.price > 100;
  });
  model.fn('priceSort', function(a, b) {
    return b.price - a.price;
  });
});

app.get('/expensive-pants', function(page, model, params, next) {
  model.subscribe('pants', function(err) {
    if (err) return next(err);
    var filter = model.filter('pants', 'expensiveItem')
      .sort('priceSort');
    filter.ref '_page.expensivePants';
    page.render('pants');
  });
});
```
```coffeescript
app.on 'model', (model) ->
  model.fn 'expensiveItem', (item) -> item.price > 100
  model.fn 'priceSort', (a, b) -> b.price - a.price

app.get '/expensive-pants', (page, model, params, next) ->
  model.subscribe 'pants', (err) ->
    return next err if err
    filter = model.filter('pants', 'expensiveItem').sort 'priceSort'
    filter.ref '_page.expensivePants'
    page.render 'pants'
```

The output of a filter is typically used by creating a reference from it. This sets the data in the model and keeps it updated.

> ### `scoped = `filter.ref` ( path )`
>
> **path:** The path at which to create a refList of the filter's output
>
> **scoped:** Returns a model scoped to the output path of the ref

The filter's value can also be retrieved directly via `filter.get()`.

> ### `results = `filter.get` ( )`
>
> **results:** Returns an array of results matching the filter

### Reactive functions

Reactive functions provide a simple way to update a computed value whenever one or more objects change. While model events respond to specific model methods and path patterns, reactive functions will be re-evaluated whenever any of thier inputs or nested properties change in any way.

They are defined similar to view helper functions, but instead of being used from templates, their outputs are set in the model.

> ### model.fn` ( name, fns )`
>
> **name:** A name that uniquely identifies the function
>
> **fns:** A getter function or an object with the form `{get: function(), set: function()}`

Reactive functions may be run any number of times, so they should be [pure functions](http://en.wikipedia.org/wiki/Pure_function). In other words, they should always return the same results given the same input arguments, and they should be side effect free. By default, the inputs to the function are retrieved directly from the model, so be sure not to modify any object or array input arguments. For example, slice an array input before you sort it. The output of the model function is deep cloned by default.

```javascript
// Model functions created with just a function act as getters only.
// These functions update the output path when any input changes
model.fn('expensiveItems', function(items) {
  return items && items.filter(function(item) {
    return item.price > 100;
  });
});

// It is also possible to define both a getter and a setter function
// if the input values may be computed from setting the output
model.fn('fullName', {
  // The getter function gets the current value of each of the input
  // arguments when any input might have changed
  get: function(firstName, lastName) {
    return firstName + ' ' + lastName;
  },
  // The setter function is called with the value that was set at
  // the output path as well as the current value of the inputs.
  // It should return an array or object where each property is an
  // index that corresponds to each input argument that should be set.
  // If the function returns null, no items will be set.
  set: function(value, firstName, lastName) {
    return value && value.split(' ');
  }
});
```
```coffeescript
# Model functions created with just a function act as getters only.
# These functions update the output path when any input changes
model.fn 'expensiveItems', (items) ->
  item for item in items when item.price > 100

# It is also possible to define both a getter and a setter function
# if the input values may be computed from setting the output
model.fn 'fullName', ->
  # The getter function gets the current value of each of the input
  # arguments when any input might have changed
  get: (firstName, lastName) ->
    firstName + ' ' + lastName
  # The setter function is called with the value that was set at
  # the output path as well as the current value of the inputs.
  # It should return an array or object where each property is an
  # index that corresponds to each input argument that should be set.
  # If the function returns null, no items will be set.
  set: (value, firstName, lastName) ->
    value?.split(' ')
```

To execute a model function, you then call `model.evaluate()` or `model.start()`. Evaluate runs a function once and returns the result, and start sets up event listeners that continually re-evaluate the function whenever any of its input or output paths are changed.

> ### `value = `model.evaluate` ( name, inputPaths..., [options] )`
>
> **name:** The name of the function defined via `model.fn()`. May instead be a function itself
>
> **inputPaths:** One or more paths whose values will be retrieved from the model via `model.get()` and passed to the function as inputs
>
> **options:** An options object. Supports the option `{copy: 'none'}`, `{copy: 'input'}`, or `{copy: 'output'}`. Defaults to `{copy: 'output'}`, which does a deep copy of the output object before it is set. This has no effect in evalutate, since it doesn't set the output in the model
>
> **value:** Returns the value computed by the function

> ### `value = `model.start` ( name, path, inputPaths..., [options] )`
>
> **name:** The name of the function defined via `model.fn()`. May instead be a function itself
>
> **path:** The output path at which to set the value and keep it updated as input paths change. Can also be set if the model function defines a `set` method as well
>
> **inputPaths:** One or more paths whose values will be retrieved from the model via `model.get()` and passed to the function as inputs. May also be set if the model function defines a `set` method
>
> **options:** An options object. Supports the option `{copy: 'none'}`, `{copy: 'input'}`, or `{copy: 'output'}`. Defaults to `{copy: 'output'}`, which does a deep copy of the output object before it is set
>
> **value:** Returns the initial value computed by the function

> ### model.stop` ( path )`
>
> **path:** The path at which the output should no longer update. Note that the value is not deleted; it is just no longer updated

Reactive functions started on the server are reinitialized when the page loads. In order to add functions for use in routes as well as in the client, use the `'model'` event emitted by apps, which occurs right before an app route is called on the server and once immediately upon initialization in the client. Then you can safely start them in the appropriate route, and they will be re-established automatically on the client.

```javascript
app.on('model', function(model) {
  // Sort the players by score and return the top X players. The
  // function will automatically update the value of '_page.leaders'
  // as players are added and removed, their scores change, and the
  // cutoff value changes.
  model.fn('topPlayers', function(players, cutoff) {
    // Note that the input array is copied with slice before sorting
    // it. The function should not modify the values of its inputs.
    return players.slice().sort(function (a, b) {
      return a.score - b.score;
    }).slice(0, cutoff - 1);
  });
});

app.get('/leaderboard/:gameId', function(page, model, params, next) {
  var game = model.at('game.' + params.gameId);
  game.subscribe(function(err) {
    if (err) return next(err);
    game.setNull('players', [
      {name: 'John', score: 4000},
      {name: 'Bill', score: 600},
      {name: 'Kim', score: 9000},
      {name: 'Megan', score: 3000},
      {name: 'Sam', score: 2000}
    ]);
    model.set('_page.cutoff', 3);
    model.start(
      // Name of the function
      'topPlayers',
      // Output path
      '_page.topPlayers',
      // Input paths
      game.at('players'),
      '_page.cutoff'
    );
    page.render();
  });
});
```
```coffeescript
app.on 'model', (model) ->
  # Sort the players by score and return the top X players. The
  # function will automatically update the value of '_page.leaders' as
  # players are added and removed, their scores change, and the
  # cutoff value changes.
  model.fn 'topPlayers', (players, cutoff) ->
    # Note that the input array is copied with slice before sorting
    # it. The function should not modify the values of its inputs.
    players.slice()
      .sort((a, b) -> a.score - b.score)
      .slice(0, cutoff - 1)

app.get '/leaderboard/:gameId', (page, model, params, next) ->
  game = model.at 'game.' + params.gameId
  game.subscribe function(err) ->
    return next err if err
    game.setNull 'players', [
      {name: 'John', score: 4000}
      {name: 'Bill', score: 600}
      {name: 'Kim', score: 9000}
      {name: 'Megan', score: 3000}
      {name: 'Sam', score: 2000}
    ]
    model.set '_page.cutoff', 3
    model.start(
      // Name of the function
      'topPlayers',
      // Output path
      '_page.topPlayers',
      // Input paths
      game.at('players'),
      '_page.cutoff'
    )
    page.render()
```

If a function is passed directly to `model.start()` instead of a function name, it will need to be manually re-initialized on the client. This is usually the best way to define reactive functions inside of component scripts, since thier init method is called both during server and client rendering.

```javascript
// The init method of a component script
exports.init = function(model) {
  function sum(x, y) {
    return x + y;
  }
  model.start(sum, 'total', 'first', 'second');
};
```
```coffeescript
// The init method of a component script
exports.init = (model) ->
  sum = (x, y) -> x + y
  model.start sum, 'total', 'first', 'second'
```