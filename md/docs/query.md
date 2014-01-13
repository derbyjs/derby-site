# Query

A way to subscribe for a part of colleciton

## Queries

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