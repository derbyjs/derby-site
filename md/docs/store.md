# Store

ShareJS wrapper

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