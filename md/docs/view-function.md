# View function

## Intro

Derby follows the semantic templating approach of Handlebars and Mustache, which helps to reduce bleeding of logic into templates. However, because of Derby's automatic bindings between the view and model, it can be useful to have computed values that are created only for the view.

View helper functions are reactive, and they are evaluated when rendering as well as whenever any bound inputs change. In addition, they can work as both getters and setters. This is especially useful when binding to form elements, such as selected options or radio buttons:

### Controller

```javascript
// Remove all whitespace from a string
view.fn('unspace', function(value) {
  return value && value.replace(/\s/g, '')
})
```
```coffeescript
# Remove all whitespace from a string
view.fn 'unspace', (value) ->
  value && value.replace(/\s/g, '')
```

### Template

```html
<h1 style="color:{unspace(home.title.color)}">
  Welcome in {home.title.color}!
</h1>
<select>
  {#each home.colors}
    <option selected="{equal(home.title.color, .name)}">
      {{.name}}
    </option>
  {/}
</select>
```

There are a handful of default view helper functions listed below. It is also possible to define custom view helper functions, such as `unspace` in the example above. The `equal` and `not` functions can act as both getters and setters. In this example, when the page renders, the option with a name equal to the value of `home.title.color` will have a `selected` attribute and the others will not. When the user selects a different option from the drop down, `home.title.color` will be set to the value of the option that is now selected.

## Defaul view helper functions

The default view helpers are:

* **equal(a, b)** - Getter and setter function. Returns `a === b` as a getter.
  Sets the output of `a` to current value of `b` if the value is true, and does
  nothing if the value is false when used as a setter.

* **not(value)** - Getter and setter function. Returns `!value` as a getter as
  well as setter.

* **or(args...)** - Accepts any number of arguments and returns the first
  truthy value or the last value. `or(x, y, z)` is equivalent to `x || y || z`
  in JavaScript.

* **and(args...)** - Accepts any number of arguments and returns the first
  falsey value or the last value. `and(x, y, z)` is equivalent to `x && y && z`
  in JavaScript.

* **gt(a, b)** - Returns `a > b`

* **lt(a, b)** - Returns `a < b`

* **gte(a, b)** - Returns `a >= b`

* **lte(a, b)** - Returns `a <= b`

For debugging:

* **log(args...)** - Applies arguments to console.log

* **trace()** - Calls console.trace()

* **debugger()** - Invokes the debugger with a `debugger;` statement

* **path(name)** - Outputs the model path for a template name. Often useful
  when combined with log, such as: `log(path(':item'), :item)`, which might
  log something like `"_page.list.0" {title: 'Pancakes', rating: 5}`

Note that helper functions provide enough flexibility to introduce complex logic into templates, which is considered bad practice. For example:

```html
<!-- WARNING: Not recommended -->
{#if lt(_page.user.score, 5)}
  <b>Let's try that again!</b>
{/}

<!-- A little better: -->
{#if lt(_page.user.score, _page.lowScoreCutoff)}
  <b>Let's try that again!</b>
{/}

<!-- Preferred: -->
{#if isLowScore(_page.user.score)}
  <b>Let's try that again!</b>
{/}
```

The first example is basically just straight logic embedded within the template. This is not recommended, because as business rules change (such as changing scoring so that 20 is now a low score), templates should not need to be modified. It is typically better to define constants in the controller code and store them in the model or pass them in as context data. Better still is to define a function specifically for each purpose, as what determines the low score could change entirely to a function of an additional input and no longer a simple cutoff.

While tempting, lots of embedded logic is likely to produce less maintainable code in the long run.