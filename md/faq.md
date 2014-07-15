### What is Derby?

Derby is a framework for developing web applications, making it much easier to build real-time collaborative functionality.

Derby app is extended Express app. You can use Connect, Express router, etc, as you do in common Express app. Some of Connect modules are parts of Derby app - this is the way Derby extends Express.  
Also Derby app has one or more client apps. Each client app has its own router, templates, styles, browserify modules, Model. Client app executes on server while first request and also its uploads to client and executes in browser. Only one client app can be in browser at unit of time.


### What is Racer?

Racer is data manipulation layer in Derby, wrapper on ShareJS. Model and Store are parts of Racer. You can use Racer without Derby.

### How are requests processed?

Client app router is located above Express router in Connect middleware. If request is catched by client app router, client app executes on server, generates html and sends it back to browser with styles and client app js. As soon as client app js is uploaded to browser, all next url changes catched by client app router in browser and html generates also there.  
If client app router can not catch request url, request falls down to Express router. Client app router has only GET method, Experss app router has all methods. Usually Express router is used for uploading files, POST requests, showing errors etc.

### What if JavaScript is disabled?

If js is disabled in browser, client app router triggers on server for every url change. In this case site looks more like static one.  
Search engine spiders also get html which is good for SEO.

### What is a Racer Model?

Model is js object that provides us api for data. All data manipulations are done through it. Model can exist on server and on client. While processing request from client, Derby creates Model, use it in client app router on server, serializes Model, upload JSON to client, deserializes it and recreates Model with state equal to those on server. Models are created on server for each request and also you can create any number of Models directly from Store anytime, but there is only one Model on client.

### What is fetch and subscribe?

Once created Model is empty. It means that there is no data in it. Before you can use any data from database, you should fill it into Model. There are two ways: fetch - just fills Model with some data, subscribe - dynamically binds Model with some data in database, if this data changes in database, data in your Model will be updated. You can fetch/subscribe whole collection, particular document, just one field in document. There are also ways to fetch/subscribe certain documents with use of Queries.

### What is a Store?

Store is singular js-object on server. All Models are created from Store. Store connected to all Models. If Model is on client, connection established by racer-browserchannel. Store is wrapper on ShareJS and a place where all OT conflict resolution magic is happen.

### What is OT?

OT - Operational Transformation - conflict resolution technique used in ShareJS. The main idea is that each operation recieved from client before being executed on data, transforms according to previous operations for this data (if there were any). If two clients send operations on same data at same time, ShareJS will execute first recieved operation and before executing second, it will transform second operation according to first operation, so second operation data changes will consider that data was already changed by first operation.  
OT is different for different data types. ShareJS uses json data type in Racer. Also there is text data type in ShareJS and plans to add rich text data type.
Using Derby you can treat OT like black box with some magic. ShareJS will merge operations for arrays, strings, number increments 'out of the box', but if two clients make set operation for same data at same time (data with same version) there is no way to capture this correcly and one of two operations will be lost. If it is critical (and you have a big head), you can create application specific data types for ShareJS.

### Why do we need Mongo and Redis?

Derby, and hence Racer, are powered by [livedb](https://github.com/share/livedb). Live DB currently only has a production ready adapter for Mongo, and optionally uses Redis to enable scaling past a single node process. More backends can be added to livedb by writing adapters, see [livedb-mongo](https://github.com/share/livedb-mongo) for example.


### How can I use web sockets with Racer instead of long pooling?

Use [racer-ws](https://github.com/derbyparty/racer-ws) or [racer-highway](https://github.com/derbyparty/racer-highway) module.

### Can I use Derby in Phonegap?

Starting from version 0.6 - yes, you can.


### What if I have more questions?

These are just a few of the frequently asked questions. This is a work in progress. If your question is not answered here, please search over on the [Google Group](https://groups.google.com/forum/?fromgroups#!forum/derbyjs). If you don't see an existing question, then let us know what is wrong. Please provide any related code snippets.

------


