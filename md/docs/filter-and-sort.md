# Filter and sort

Data manipulations

## Intro

Filters create a live-updating list from items in an object or another list. They provide an interface similar to the array.filter and array.sort methods of Javascript, but the results automatically update as the input items change.

> ### `filter = `model.filter` ( inputPath, [name] )`
>
> **inputPath:** A path pointing to an object or array. The path's values will be retrieved from the model via `model.get()`, and then each item will be checked against the filter function
>
> **name:** *(optional)* The name of the function defined via `model.fn()`. May instead be a function itself. The function should have the arguments `function(item, key, object)` for collections and objects, and `function(item, index, array)` for arrays. Like functions for [array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), the function should return true for values that match the filter

If `model.filter` is called without a filter function, it will create a list out of all items in the input object. This can be handy as a way to render all subscribed items in a collection, since only arrays can be used as an input to `{#each}` template tags.

> ### `filter = `model.sort` ( inputPath, [name] )`
>
> **inputPath:** A path pointing to an object or array. The path's values will be retrieved from the model via `model.get()`, and then each item will be checked against the filter function
>
> **name:** *(optional)* The name of the function defined via `model.fn()`. May instead be a function itself. The function should should be a compare function with the arguments `function(a, b)`. It should return the same values as compare functions for [array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

There are two default named functions defined for sorting, `asc` and `desc`. If sort is called without a function name, it defaults to using the `asc` function. These functions compare each item with Javascript's less than and greater than operators. See MDN for more info on [sorting non-ASCII characters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Sorting_non-ASCII_characters).

You define functions to be used in `model.filter` and `model.sort` via [`model.fn`](#modelfn). See the next section for more info.

A filter may have both a filter function and a sort function by chaining the two calls:

```javascript
app.on('model', function(model) {
  model.fn('expensiveItem', function(item) {
    return item.price > 100;
  });
  model.fn('priceSort', function(a, b) {
    return b.price - a.price;
  });
});

app.get('/expensive-pants', function(page, model, params, next) {
  model.subscribe('pants', function(err) {
    if (err) return next(err);
    var filter = model.filter('pants', 'expensiveItem')
      .sort('priceSort');
    filter.ref '_page.expensivePants';
    page.render('pants');
  });
});
```
```coffeescript
app.on 'model', (model) ->
  model.fn 'expensiveItem', (item) -> item.price > 100
  model.fn 'priceSort', (a, b) -> b.price - a.price

app.get '/expensive-pants', (page, model, params, next) ->
  model.subscribe 'pants', (err) ->
    return next err if err
    filter = model.filter('pants', 'expensiveItem').sort 'priceSort'
    filter.ref '_page.expensivePants'
    page.render 'pants'
```

The output of a filter is typically used by creating a reference from it. This sets the data in the model and keeps it updated.

> ### `scoped = `filter.ref` ( path )`
>
> **path:** The path at which to create a refList of the filter's output
>
> **scoped:** Returns a model scoped to the output path of the ref

The filter's value can also be retrieved directly via `filter.get()`.

> ### `results = `filter.get` ( )`
>
> **results:** Returns an array of results matching the filter