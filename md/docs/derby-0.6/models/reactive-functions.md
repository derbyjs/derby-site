# Reactive functions

Reactive functions provide a simple way to update a computed value whenever one or more objects change. While model events respond to specific model methods and path patterns, reactive functions will be re-evaluated whenever any of thier inputs or nested properties change in any way.

Reactive functions may be run any number of times, so they should be [pure functions](http://en.wikipedia.org/wiki/Pure_function). In other words, they should always return the same results given the same input arguments, and they should be side effect free. By default, the inputs to the function are retrieved directly from the model, so be sure not to modify any object or array input arguments. For example, slice an array input before you sort it. The output of the model function is deep cloned by default.

To execute a model function, you then call `model.evaluate()` or `model.start()`. Evaluate runs a function once and returns the result, and start sets up event listeners that continually re-evaluate the function whenever any of its input or output paths are changed.

> `value = model.start(path, inputPaths..., [options], fn)`
> `value = model.evaluate(inputPaths..., [options], fn)`
> * `path` The output path at which to set the value and keep it updated as input paths change. Can also be set if the model function defines a `set` method as well
> * `inputPaths` One or more paths whose values will be retrieved from the model via `model.get()` and passed to the function as inputs. May also be set if the model function defines a `set` method
> * `options:`
>   * `copy` Supports `'output'` (default), `'input'`, `'both'`, or `'none'`. Does a deep copy of the output object before it is set. `'output'` has no effect in evalutate, since it doesn't set the output in the model
>   * `mode` Supports `'diffDeep'` (default), `'diff'`, `'arrayDeep'`, or `'array'`. The method to use when setting. Has no effect in evaluate
> * `fn`  A function or the name of a function defined via `model.fn()`
> * `value` Returns the initial value computed by the function

> `model.stop(path)`
> * `path` The path at which the output should no longer update. Note that the value is not deleted; it is just no longer updated

In DerbyJS, `model.start()` functions should typically be established in the `init` method of a component. This method is called both before rendering on the server and then again before rendering in the browser. These reactive functions will be stopped as soon as the component is destroyed, which happens automatically when the component is removed from the page.

```js
MyComponent.prototype.init = function(model) {
  function sum(x, y) {
    return x + y;
  }
  model.start('total', 'first', 'second', sum);
};
```

## Two-way reactive functions

Most reactive functions define a getter only. You should treat their output as read only. In addition, it is possible to define two-way reactive functions with both a setter and a getter. Note that this is a more advanced pattern and should not be used unless you are confident that it is a strong fit for your use case.

```js
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

## Named functions

In addition to passing in a function directly, a function can be defined on a model via a name. This name can then be used in place of a function argument.

> `model.fn(name, fn)`
> * `name` A name that uniquely identifies the function
> * `fn` A getter function or an object with the form `{get: function(), set: function()}`

Reactive functions started on the server via a name are reinitialized when the page loads. In order to add functions for use in routes as well as in the client, use the `'model'` event emitted by apps, which occurs right before an app route is called on the server and once immediately upon initialization in the client. Then, you can safely start them in the appropriate route, and they will be re-established automatically on the client.

In DerbyJS, this pattern is generally less preferable to initializing model functions in a component.

```js
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
      // Output path
      '_page.topPlayers',
      // Input paths
      game.at('players'),
      '_page.cutoff',
      // Name of the function
      'topPlayers'
    );
    page.render();
  });
});
```
