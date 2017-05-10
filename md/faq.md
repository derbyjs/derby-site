### What is DerbyJS?

DerbyJS is a framework for developing web applications, making it much easier to build real-time collaborative functionality.

Built from a collection of standard Node.js modules, DerbyJS can be brought into existing projects, or existing node modules can easily be brought into a DerbyJS project.

Derby provides server-side rendering through it's HTML-like templating language. Templates can be organized into components for better code reuse and faster application development.
Templates and components are backed by a real-time data model called Racer.


### What is Racer?

Racer is the data manipulation layer in Derby, it wraps the [ShareDB](https://github.com/share/sharedb) library. Racer provides a consistent API for managing data on the server and client, and seamlessly syncs the two with little thought from the user.


### How does Racer compare to Firebase?

Racer provides a lot of the same functionality as Firebase. Besides the obvious tradeoffs between open source and proprietary (supported) software, Racer has more granular update information, while Firebase has more mature solutions around authentication and documentation.


### What is a Racer Model?

The Model is a JavaScript object that provides an api for real-time data. All data manipulations are done through it, and the model is synced on both the server and the client. Models are created on server for each request and also you can create any number of Models directly from a Store anytime, but there is only one Model on client.


### What is a Racer Store?

Store is singular JavaScript object on the server for managing database connections. All Models are created from Store. If a Model is on the client, a connection to the store is established by racer-browserchannel. The Store is wrapper on [ShareJS](http://sharejs.org) and a place where all OT conflict resolution magic is happen.

### What is OT?

OT - [Operational Transformation](http://en.wikipedia.org/wiki/Operational_transformation) - is a conflict resolution technique used in [ShareJS](http://sharejs.org). The main idea is to resolve conflicts created by multiple clients trying to modify the same data in a distributed system.
OT is different for different data types. ShareJS uses a json data type in Racer. There is also a text data type in ShareJS and plans to add a rich text data type.
Using Derby you can treat OT like black box with some magic. ShareJS will merge operations for arrays, strings, number increments 'out of the box', but if two clients make set operation for same data at same time (data with same version) there is no way to capture this correcly and one of two operations will be lost. If it is critical (and you have a big head), you can create application specific data types for ShareJS.

### Why do we need Mongo and Redis?

Derby, and hence Racer, are powered by [ShareDB](https://github.com/share/sharedb). ShareDB currently only has a production ready adapter for Mongo, and optionally uses Redis to enable scaling past a single node process. More backends can be added to ShareDB by writing adapters, see [sharedb-mongo](https://github.com/share/sharedb-mongo) for example.


### How can I use web sockets with Racer instead of long polling?

Use [racer-ws](https://github.com/derbyparty/racer-ws) or [racer-highway](https://github.com/derbyparty/racer-highway) module.

### What is fetch and subscribe?

A newly created Model has no data in it. Before you can use any data from the database, you need to bring it into Model. There are two methods: fetch - simply queries the database and loads it into the Model, subscribe - similarly queries the database and loads the data into the Model, but if this data changes in the database, data in your Model will be updated. You can fetch/subscribe whole collections, particular documents, or even just one field in a document.


### What if JavaScript is disabled?

If js is disabled in browser, client app router triggers on server for every url change. In this case site looks more like static one.
Search engine spiders also get html which is good for SEO.

### Can I use Derby in Phonegap?

Starting from version 0.6 - yes, you can.


### What if I have more questions?

These are just a few of the frequently asked questions. This is a work in progress. If your question is not answered here, please search over on the [Google Group](https://groups.google.com/forum/?fromgroups#!forum/derbyjs). If you don't see an existing question, then let us know what is wrong. Please provide any related code snippets.

------
