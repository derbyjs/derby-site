# Reactive function

## Intro

Reactive functions provide a simple way to update a computed value whenever one or more objects change. While model events respond to specific model methods and path patterns, reactive functions will be re-evaluated whenever any of thier inputs or nested properties change in any way.

They are defined similar to view helper functions, but instead of being used from templates, their outputs are set in the model.

> ### model.fn` ( name, fns )`
>
> **name:** A name that uniquely identifies the function
>
> **fns:** A getter function or an object with the form `{get: function(), set: function()}`

Reactive functions may be run any number of times, so they should be [pure functions](http://en.wikipedia.org/wiki/Pure_function). In other words, they should always return the same results given the same input arguments, and they should be side effect free. By default, the inputs to the function are retrieved directly from the model, so be sure not to modify any object or array input arguments. For example, slice an array input before you sort it. The output of the model function is deep cloned by default.

```javascript
// Model functions created with just a function act as getters only.
// These functions update the output path when any input changes
model.fn('expensiveItems', function(items) {
  return items && items.filter(function(item) {
    return item.price > 100;
  });
});

// It is also possible to define both a getter and a setter function
// if the input values may be computed from setting the output
model.fn('fullName', {
  // The getter function gets the current value of each of the input
  // arguments when any input might have changed
  get: function(firstName, lastName) {
    return firstName + ' ' + lastName;
  },
  // The setter function is called with the value that was set at
  // the output path as well as the current value of the inputs.
  // It should return an array or object where each property is an
  // index that corresponds to each input argument that should be set.
  // If the function returns null, no items will be set.
  set: function(value, firstName, lastName) {
    return value && value.split(' ');
  }
});
```
```coffeescript
# Model functions created with just a function act as getters only.
# These functions update the output path when any input changes
model.fn 'expensiveItems', (items) ->
  item for item in items when item.price > 100

# It is also possible to define both a getter and a setter function
# if the input values may be computed from setting the output
model.fn 'fullName', ->
  # The getter function gets the current value of each of the input
  # arguments when any input might have changed
  get: (firstName, lastName) ->
    firstName + ' ' + lastName
  # The setter function is called with the value that was set at
  # the output path as well as the current value of the inputs.
  # It should return an array or object where each property is an
  # index that corresponds to each input argument that should be set.
  # If the function returns null, no items will be set.
  set: (value, firstName, lastName) ->
    value?.split(' ')
```

To execute a model function, you then call `model.evaluate()` or `model.start()`. Evaluate runs a function once and returns the result, and start sets up event listeners that continually re-evaluate the function whenever any of its input or output paths are changed.

> ### `value = `model.evaluate` ( name, inputPaths..., [options] )`
>
> **name:** The name of the function defined via `model.fn()`. May instead be a function itself
>
> **inputPaths:** One or more paths whose values will be retrieved from the model via `model.get()` and passed to the function as inputs
>
> **options:** An options object. Supports the option `{copy: 'none'}`, `{copy: 'input'}`, or `{copy: 'output'}`. Defaults to `{copy: 'output'}`, which does a deep copy of the output object before it is set. This has no effect in evalutate, since it doesn't set the output in the model
>
> **value:** Returns the value computed by the function

> ### `value = `model.start` ( name, path, inputPaths..., [options] )`
>
> **name:** The name of the function defined via `model.fn()`. May instead be a function itself
>
> **path:** The output path at which to set the value and keep it updated as input paths change. Can also be set if the model function defines a `set` method as well
>
> **inputPaths:** One or more paths whose values will be retrieved from the model via `model.get()` and passed to the function as inputs. May also be set if the model function defines a `set` method
>
> **options:** An options object. Supports the option `{copy: 'none'}`, `{copy: 'input'}`, or `{copy: 'output'}`. Defaults to `{copy: 'output'}`, which does a deep copy of the output object before it is set
>
> **value:** Returns the initial value computed by the function

> ### model.stop` ( path )`
>
> **path:** The path at which the output should no longer update. Note that the value is not deleted; it is just no longer updated

Reactive functions started on the server are reinitialized when the page loads. In order to add functions for use in routes as well as in the client, use the `'model'` event emitted by apps, which occurs right before an app route is called on the server and once immediately upon initialization in the client. Then you can safely start them in the appropriate route, and they will be re-established automatically on the client.

```javascript
app.on('model', function(model) {
  // Sort the players by score and return the top X players. The
  // function will automatically update the value of '_page.leaders'
  // as players are added and removed, their scores change, and the
  // cutoff value changes.
  model.fn('topPlayers', function(players, cutoff) {
    // Note that the input array is copied with slice before sorting
    // it. The function should not modify the values of its inputs.
    return players.slice().sort(function (a, b) {
      return a.score - b.score;
    }).slice(0, cutoff - 1);
  });
});

app.get('/leaderboard/:gameId', function(page, model, params, next) {
  var game = model.at('game.' + params.gameId);
  game.subscribe(function(err) {
    if (err) return next(err);
    game.setNull('players', [
      {name: 'John', score: 4000},
      {name: 'Bill', score: 600},
      {name: 'Kim', score: 9000},
      {name: 'Megan', score: 3000},
      {name: 'Sam', score: 2000}
    ]);
    model.set('_page.cutoff', 3);
    model.start(
      // Name of the function
      'topPlayers',
      // Output path
      '_page.topPlayers',
      // Input paths
      game.at('players'),
      '_page.cutoff'
    );
    page.render();
  });
});
```
```coffeescript
app.on 'model', (model) ->
  # Sort the players by score and return the top X players. The
  # function will automatically update the value of '_page.leaders' as
  # players are added and removed, their scores change, and the
  # cutoff value changes.
  model.fn 'topPlayers', (players, cutoff) ->
    # Note that the input array is copied with slice before sorting
    # it. The function should not modify the values of its inputs.
    players.slice()
      .sort((a, b) -> a.score - b.score)
      .slice(0, cutoff - 1)

app.get '/leaderboard/:gameId', (page, model, params, next) ->
  game = model.at 'game.' + params.gameId
  game.subscribe function(err) ->
    return next err if err
    game.setNull 'players', [
      {name: 'John', score: 4000}
      {name: 'Bill', score: 600}
      {name: 'Kim', score: 9000}
      {name: 'Megan', score: 3000}
      {name: 'Sam', score: 2000}
    ]
    model.set '_page.cutoff', 3
    model.start(
      // Name of the function
      'topPlayers',
      // Output path
      '_page.topPlayers',
      // Input paths
      game.at('players'),
      '_page.cutoff'
    )
    page.render()
```

If a function is passed directly to `model.start()` instead of a function name, it will need to be manually re-initialized on the client. This is usually the best way to define reactive functions inside of component scripts, since thier init method is called both during server and client rendering.

```javascript
// The init method of a component script
exports.init = function(model) {
  function sum(x, y) {
    return x + y;
  }
  model.start(sum, 'total', 'first', 'second');
};
```
```coffeescript
// The init method of a component script
exports.init = (model) ->
  sum = (x, y) -> x + y
  model.start sum, 'total', 'first', 'second'
```