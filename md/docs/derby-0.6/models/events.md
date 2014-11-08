# Events

Model events are based on the standard [Node.js EventEmitter](http://nodejs.org/docs/latest/api/events.html) methods, and they support the same methods: `on`, `once`, `removeListener`, `emit`, etc.

## Mutation events

Racer emits events whenever it mutates data via `model.set()`, `model.push()`, etc. It also emits events when data is remotely updated via a subscription. These events provide an entry point for an app to react to a specific data mutation or pattern of data mutations. The events might not be exactly the same as the methods that created them, since they can be transformed via OT.

`model.on()` and `model.once()` accept a second argument for these mutation events. The second argument is a path pattern that will filter emitted events, calling the handler function only when a mutator matches the pattern. Path patterns support a single segment wildcard (`*`) anywhere in a path, and a multi-segment wildcard (`**`) at the end of the path. The multi-segment wildcard alone (`'**'`) matches all paths.

> `listener = model.on(method, path, eventCallback)`
> * `method` Name of the mutator method: `'change'`, `'insert'`, `'remove'`, `'move'`, `'load'`, `'unload'`, or `'all'`
> * `path` Pattern matching the path being mutated. For example: `'_page.user'`, `'users.*.name'`, `'users.*'`, `'users.**'`, `'users**'`, or `'**'`
> * `eventCallback` Function to call when a matching method and path are mutated
> * `listener` Returns the listener function subscribed to the event emitter. This is the function that should be passed to `model.removeListener`

The event callback receives a number of arguments based on the path pattern and method. The arguments are:

> `eventCallback(captures..., [event], args..., passed)`
> * `captures` The path segment or segments that match the wildcards in the path pattern
> * `event` The `'all'` event adds the emitted event name after the captures and before the args
> * `args` Event specific arguments. See below
> * `passed` An object with properties provided via `model.pass()`. See description below

### Event arguments

> `changeEvent(captures..., value, previous, passed)`
> * `value` The current value at the path that was changed. Will be `undefined` for objects that were deleted
> * `previous` The previous value at the path. Will be `undefined` for paths set for the first time

> `insertEvent(captures..., index, values, passed)`
> * `index` The index at which items were inserted
> * `values` An array of values that were inserted. Always an array, even if only one item was pushed, unshifted, or inserted

> `removeEvent(captures..., index, removed, passed)`
> * `value` The current value at the path that was changed. Will be `undefined` for objects that were deleted
> * `removed` An array of values that were removed. Always an array, even if only one item was popped, shifted, or removed

> `moveEvent(captures..., from, to, howMany, passed)`
> * `from` The index from which items were moved
> * `to` The index to which items were moved
> * `howMany` How many items were moved

> `loadEvent(captures..., document, passed)`
> * `document` This event fires when a document is loaded via a subscription or fetch. It emits the value of the newly loaded document object

> `unloadEvent(captures..., previousDocument, passed)`
> * `previousDocument` This event fires when a document is removed from the model via unsubscribe or unfetch. It emits the value of the document object that was unloaded

On a string insert or string remove mutation, a `'change`' event is emitted, since strings are immutable values, and inserting or removing from a string requires changing its entire value. However, detail on what specifically was inserted or removed is neccessary to implement view bindings properly for realtime collaborative text editing. This additional information is added to the `passed` object. On a string insert, the passed object has an additional property of `$stringInsert: {index: Number, text: String}`. On a string remove, the passed object has an additional property of `$stringRemove: {index: Number, howMany: Number}`.

```js
// Matches model.push('messages', message)
model.on('insert', 'messages', function(index, [message]) {
  ...
});

// Matches model.set('todos.4.completed', true), etc.
model.on('change', 'todos.*.completed', function(todoId, isComplete) {
  ...
});

// Matches all events
model.on('all', '**', function(path, event, args...) {
  ...
});
```

### Passing data to event listeners

> `model.pass(object)`
> * `object` An object whose properties will each be set on the `passed` argument

`model.pass()` can be chained before calling a mutator method to pass an argument to model event listeners. You must pass it an object with a property that identifies the name of the parameter.

This value is only passed to local listeners, and it is not sent to the server or other clients. It is typically used to identify the originator of a particular mutation so that multiple responses to the same change and infinite loops may be avoided. Such loops could occur for listeners that respond to paths that they may modify.

```js
// Logs:
//   'red', {}
//   'green', {message: 'hi'}

model.on('change', 'color', function(value, previous, passed) {
  console.log(value, passed);
});
model.set('color', 'red');
model.pass({message: 'hi'}).set('color', 'green');
```
