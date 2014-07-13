### What if I have not found an answer?

These are just a few of the frequently asked questions. This is a work in progress. If your question is not answered here, please search over on the [Google Group](https://groups.google.com/forum/?fromgroups#!forum/derbyjs). If you don't see an existing question, then let us know what is wrong. Please be as straightforward as possible, and provide any related code snippets.

### What is Derby application?

Derby app is extended Express app. You can use Connect, Express router, etc, as you do in common Express app. Some of Connect modules are parts of Derby app - this is the way Derby extends Express.  
Also Derby app has one or more client apps. Each client app has its own router, templates, styles, browserify modules, Model. Client app executes on server while first request and also its uploads to client and executes in browser. Only one client app can be in browser at unit of time.

### How request is processed?

Client app router is located above Express router in Connect middleware. If request is catched by client app router, client app executes on server, generates html and sends it back to browser with styles and client app js. As soon as client app js is uploaded to browser, all next url changes catched by client app router in browser and html generates also there.  
If client app router can not catch request url, request falls down to Express router. Client app router has only GET method, Experss app router has all methods. Usually Express router is used for uploading files, POST requests, showing errors etc.

### What if js is disabled?

If js is disabled in browser, client app router triggers on server for every url change. In this case site looks more like static one.  
Search engine spiders also get html which is good for SEO.

### What is Model?

Model is js-object that provides us api for data. All data manipulations are done through it. Model can exist on server and on client. While processing request from client, Derby creates Model, use it in client app router on server, serializes Model, upload JSON to client, deserializes it and recreates Model with state equal to those on server. Models are created on server for each request and also you can create any number of Models directly from Store anytime, but there is only one Model on client.

### What is fetch and subscribe?

Once created Model is empty. It means that there is no data in it. Before you can use any data from database, you should fill it into Model. There are two ways: fetch - just fills Model with some data, subscribe - dynamically binds Model with some data in database, if this data changes in database, data in your Model will be updated. You can fetch/subscribe whole collection, particular document, just one field in document. There are also ways to fetch/subscribe certain documents with use of Queries.

### What is Store?

Store is singular js-object on server. All Models are created from Store. Store connected to all Models. If Model is on client, connection established by racer-browserchannel. Store is wrapper on ShareJS and a place where all OT conflict resolution magic is happen.

### What is Racer?

Racer is data manipulation layer in Derby, wrapper on ShareJS. Model and Store are parts of Racer. You can use Racer without Derby.

### What is OT?

OT - Operational Transformation - conflict resolution technique used in ShareJS. Main idea is that each operation recieved from client before being executed on data, transforms according to previous operations for this data (if there were any). If two clients send operations on same data at same time, ShareJS will execute first recieved operation and before executing second, it will transform second operation according to first operation, so second operation data changes will consider that data was already changed by first operation.  
OT is different for different data types. ShareJS uses json data type in Racer. Also there is text data type in ShareJS and plans to add rich text data type.
Using Derby you can treat OT like black box with some magic. ShareJS will merge operations for arrays, strings, number increments 'out of the box', but if two clients make set operation for same data at same time (data with same version) there is no way to capture this correcly and one of two operations will be lost. If it is critical (and you have a big head), you can create application specific data types for ShareJS.

### Why do we need two databases?

For data synchronization between clients we need some kind of database events to be aware if data is changed. If we implement these events in app code, there would not be way to scale app to more than one process. Another way is to use database PubSub. Mongo has limited PubSub, so there is no way to use it for most of applications. Another story is Redis - fast, full PubSub. So LiveDB (data store for ShareJS) stores data in Mongo, but uses Redis PubSub to synchronize clients. Also there is cache of last operations in Redis. And we can store history of all operations in same Mongo database as data (by default), in another one or do not store operations at all.  
There is easy way to change Mongo to something else, you just need to write adapter like livedb-mongo. Changing Redis is not trivial thing.

### Why racer-browserchanel uses long pooling and not web sockets?

Web sockets does not guarantee order of messages between client and server, which is critical for OT.

### What kind of projects Derby is suitable for?

Derby is good for most kinds of projects. You can use it for static sites without database as for multiplayer real-time games and big interactive sites.

### How can we limit access to data?

There is Racer plugin: racer-access. You can restrict access to collection and document. There is no way to limit access to particular fields of document.

### What about authorization?

Derby + Everyauth have some problems with login/password authorization. So recomendation - to use Passport. There are derby-auth and derby-passport modules, which are suitable for most Derby apps.

### Why there are two collections in derby-auth?

There is no way to restrict access in Derby for some fields of documents and allow it for another fields of same documents. So there is no way to restrict access to user password and allow access to user name using one collection. So derby-auth uses two collections: auth - for passwords, users - for everything else.

### Can I use Derby in Phonegap?

Starting from version 0.6 - yes, you can.

### Is there way to run server code from client?

You can use server-hooks (events for data changes) or send post request to express router to execute some code.

------


