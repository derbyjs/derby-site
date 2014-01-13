# Model

Data manipulation API


## Intro

Derby models are powered by [Racer](http://racerjs.com/), a realtime model synchronization engine. Racer enables multiple users to interact with the same data objects via sophisticated conflict detection and resolution algorithms. At the same time, it provides a simple object accessor and event interface for writing application logic.

## Creating models

Derby provides a model when calling application routes. On the server, it creates an empty model from the `store` associated with an app. When the server renders the page, the model is serialized. It is then reinitialized into the same state on the client. This model object is passed to app routes rendered on the client.

Derby uses the model supplied by the store.modelMiddleware by calling `req.getModel()`. To pass data from server-side express middleware or routes, the model can be retrieved via this same method and data can be set on it before passing control to the app router. Model's created from `req.getModel()` specify the option `{fetchOnly: true}`. This means that calls to `model.subscribe()` actually only fetch data and don't subscribe. This is more efficient during server-side rendering, since the model is only created for long enough to handle the route and render the page. The model then gets subscribed when it initializes in the browser.

If you would like to get or set data outside of the app on the server, you can create models directly via `store.createModel()`.

> ### `model = `store.createModel` ( options )`
>
> **model:** A Racer model object associated with the given store

## Getters and setters

Model mutator methods are applied optimistically. This means that changes are reflected immediately, but they may ultimately fail or be transformed to something else after being sent to the server. All model mutator methods are synchronous and provide an optional callback.

### Basic methods

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

### Array methods

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

### String methods

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

## Events

Models inherit from the standard [Node.js EventEmitter](http://nodejs.org/docs/latest/api/events.html), and they support the same methods: `on`, `once`, `removeListener`, `emit`, etc.

### Model mutator events

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

### Model mutator event arguments

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

### model.pass

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

## GUIDs

Models provide a method to create globally unique ids. These can be used as part of a path or within mutator methods.

> ### `guid = `model.id` ( )`
>
> **guid:** Returns a globally unique identifier that can be used for model operations

## Scoped models

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