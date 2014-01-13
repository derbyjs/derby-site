# Subscription


## Intro

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