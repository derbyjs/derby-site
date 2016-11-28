# Backends

Racer stores are backed by ShareJS, which uses [LiveDB](https://github.com/share/livedb) to persist data, perform queries, keep a journal of all operations, and pub/sub operations and changes to queries. Currently, LiveDB has adapters for in memory or Redis based pub/sub and supports storage in memory or MongoDB via [livedb-mongo](https://github.com/share/livedb-mongo). LiveDB is written with support for additional database adapters in mind.

Getting started with a single-process server and MongoDB:

```js
var derby = require('derby');
var livedb = require('livedb');
var liveDbMongo = require('livedb-mongo');

var db = liveDbMongo('mongodb://localhost:27017/test');
var backend = livedb.client(db);
var store = derby.createStore({backend: backend});
```

The above examples use the in-process driver by default. In a production environment, you'll want to scale accross multiple frontend servers and support updating data in other processes, such as migration scripts and additional services. For this, you should use the LiveDB Redis driver. LiveDB requires Redis 2.6 or newer, since it uses Lua scripting commands.

```js
var derby = require('derby');
var livedb = require('livedb');
var liveDbMongo = require('livedb-mongo');
var redis = require('redis');

var db = liveDbMongo('mongodb://localhost:27017/test');
// Two Redis clients are needed, since Redis requires separate clients for
// pub/sub commands and other Redis commands
var redisClient = redis.createClient();
var redisObserver = redis.createClient();
var driver = livedb.redisDriver(db, redisClient, redisObserver);
var backend = livedb.client({snapshotDb: db, driver: driver});
var store = derby.createStore({backend: backend});
```

See the [LiveDB](https://github.com/share/livedb#using-livedb), [MongoSkin](https://github.com/kissjs/node-mongoskin#usage), and [node-redis](https://github.com/mranney/node_redis#rediscreateclient) documentation for more information on configuration options.

The Redis driver supports flushing all data from Redis or starting with an empty Redis database with journal and snapshot data in MongoDB. Thus, it is OK to start with a basic deployment using only a single process and add Redis later or to flush the Redis database if it becomes corrupt.

## Mapping between database and model

Racer paths are translated into database collections and documents using a natural mapping:

```
collection.documentId.documentProperty
```

LiveDB Mongo will add `_type`, and `_v` properties to Mongo documents for internal use. It will strip out these properties as well as `_id` when it returns the document from Mongo. If a document is an object, it will be stored as the Mongo document directly. If it is another type, it will be nested under a property on the Mongo document caleld `_data`. For object documents, Racer will set the `id` property on the document object in the model automatically.

It is not possible to set or delete an entire collection, or get the list of collections via the Racer API.

## Loading data into a model

The `subscribe`, `fetch`, `unsubscribe`, and `unfetch` methods are used to load and unload data from ShareJS. These methods don't return data directly. Rather, they load the data into a model. Once loaded, the data are then accessed via model getter methods.

`subscribe` and `fetch` both return data initially, but subscribe also registers with pub/sub on the server to receive ongoing updates as the data change.

> `model.subscribe(items..., callback(err))`  
> `model.fetch(items..., callback(err))`   
> `model.unsubscribe(items..., callback(err))`  
> `model.unfetch(items..., callback(err))`  
> * `items` Accepts one or more subscribable items, including a document path, scoped model, or query
> * `callback` Calls back once all of the data for each query and document has been loaded or when an error is encountered

Avoid subscribing or fetching queries by document id like `model.query('users', {_id: xxx})`. You can achieve the same result passing `'users.xxx'` or `model.at('users.xxx')` to subscribe or fetch, and it is much more efficient.

If you only have one argument in your call to subscribe or fetch, you can also call `subscribe`, `fetch`, `unsubscribe`, and `unfetch` on the query or scoped model directly.

```js
var user = model.at('users.' + userId);
var todosQuery = model.query('todos', {creatorId: userId});
model.subscribe(user, todosQuery, function(err) {
  if (err) return next(err);
  console.log(user.get(), todosQuery.get());
  page.render();
});
```

Racer internally keeps track of the context in which you call subscribe or fetch, and it counts the number of times that each item is subscribed or fetched. To actually unload a document from the model, you must call the unsubscribe method the same number of times that subscribe is called and the unfetch method the same number of times that fetch is called. However, you generally don't need to worry about calling unsubscribe and unfetch manually.

Instead, the `model.unload()` method can be called to unsubscribe and unfetch from all of the subscribes and fetches performed since the last call to unload. Derby calls this method on every full page render right before entering a route. By default, the actual unsusbscribe and unfetch happens after a short delay, so if something gets resubscribed during routing, the item will never end up getting unsubscribed and it will callback immediately.
