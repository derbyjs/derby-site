# Backends

Racer stores are backed by ShareDB, which is used to persist data, perform queries, keep a journal of all operations, and pub/sub operations and changes to queries. Currently, ShareDB has [two pub/sub adapters](https://github.com/share/sharedb#database-adapters): one for in memory and one for Redis based pub/sub. ShareDB supports in memory or MongoDB storage. The database adapter [ShareDBMongo](https://github.com/share/sharedb-mongo)
is backed by a real Mongo database and full query support. ShareDB is written with support for additional database adapters in mind.

Getting started with a single-process server and MongoDB:

```js
var racer = require('racer');
var ShareDbMongo = require('sharedb-mongo');

var db = new ShareDbMongo({mongo: 'mongodb://localhost:27017/test'});
var backend = racer.createBackend({db: db});
var model = backend.createModel();
```

The above examples use the in-process driver by default. In a production environment, you'll want to scale across multiple frontend servers and support updating data in other processes, such as migration scripts and additional services. For this, you should use the [ShareDB Redis pub/sub adapter](https://github.com/share/sharedb-redis-pubsub). ShareDB requires Redis 2.6 or newer, since it uses Lua scripting commands.

```js
var racer = require('racer');
var redis = require('redis');
var ShareDbMongo = require('sharedb-mongo');
var RedisPubSub = require('sharedb-redis-pubsub');


// Two Redis clients are needed, since Redis requires separate clients for
// pub/sub commands and other Redis commands
var pubsub = new RedisPubSub({
  client: redis.createClient()
  observer: redis.createClient()
});
var db = new ShareDbMongo({mongo: 'mongodb://localhost:27017/test'});
var backend = racer.createBackend({
  db: db,
  pubsub: pubsub
});
var model = backend.createModel();
```

See [ShareDBMongo](https://github.com/share/sharedb-mongo) and [ShareDB Redis](https://github.com/share/sharedb-redis-pubsub) documentation for more information on configuration options.

The Redis driver supports flushing all data from Redis or starting with an empty Redis database with journal and snapshot data in MongoDB. Thus, it is OK to start with a basic deployment using only a single process and add Redis later or to flush the Redis database if it becomes corrupt.

## Mapping between database and model

Racer paths are translated into database collections and documents using a natural mapping:

```
collection.documentId.documentProperty
```

ShareDB Mongo will add `_type`, and `_v` properties to Mongo documents for internal use. It will strip out these properties as well as `_id` when it returns the document from Mongo. If a document is an object, it will be stored as the Mongo document directly. If it is another type, it will be nested under a property on the Mongo document called `_data`. For object documents, Racer will set the `id` property on the document object in the model automatically.

It is not possible to set or delete an entire collection, or get the list of collections via the Racer API.

## Loading data into a model

The `subscribe`, `fetch`, `unsubscribe`, and `unfetch` methods are used to load and unload data from ShareJS. These methods don't return data directly. Rather, they load the data into a model. Once loaded, the data are then accessed via model getter methods.

`subscribe` and `fetch` both return data initially, but subscribe also registers with pub/sub on the server to receive ongoing updates as the data change.

> `model.subscribe(items..., callback(err))`  
> `model.fetch(items..., callback(err))`   
> `model.unsubscribe(items..., callback(err))`  
> `model.unfetch(items..., callback(err))`  
> * `items` Accepts one or more subscribe-able items, including a document path, scoped model, or query
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

Instead, the `model.unload()` method can be called to unsubscribe and unfetch from all of the subscribes and fetches performed since the last call to unload. Derby calls this method on every full page render right before entering a route. By default, the actual unsubscribe and unfetch happens after a short delay, so if something gets resubscribed during routing, the item will never end up getting unsubscribed and it will callback immediately.
