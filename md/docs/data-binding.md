# Data Binding

## Variables

Variables insert a value from the context or model with a given name. If the
name isn't found, nothing will be inserted. Values are HTML escaped by default.
The `unescaped` keyword may be used to insert a value without escaping.

### Template

```html
<Body:>
  <p>{{name}}</p>
  <p>{{age}}</p>
  <p>{{location}}</p>
  <p>{{unescaped location}}</p>
```

### Context

```javascript
page.render({ name: 'Parker', location: '<b>500 ft</b> away' });
```
```coffeescript
page.render name: 'Parker', location: '<b>500 ft</b> away'
```

### Output

```html
<p>Parker</p>
<p></p>
<p>&lt;b>500 ft&lt;/b> away</p>
<p><b>500 ft</b> away</p>
```

## Sections

Sections set the scope of the context for their contents. In the case of `if`,
`unless`, `else if`, `else`, and `each`, they also cause their contents to be
conditionally rendered. `with` is used to only set the scope and always render.
In Handlebars, sections begin and end with the same block type, but Derby
requires only an ending slash.

As in Handlebars, falsey values include all falsey JavaScript values (`false`,
`null`, `undefined`, `0`, `''`, and `NaN`) as well as empty arrays (`[]`). All
other values are truthy.

### Template

```html
<Body:>
  <h1>
    {{#if visited}}
      Welcome back!
    {{else}}
      Welcome to the party!
    {{/}}
  </h1>
  <ul>
    {{#each users}}
      <li>{{name}}: {{motto}}</li>
    {{/}}
  </ul>
  {{#unless hideFooter}}
    {{#with meta}}
      <small>Copyright &copy; {{year}} Party Like It's.</small>
    {{/}}
  {{/}}
```

### Context

```javascript
page.render({
  visited: true
, users: [
    { name: 'Billy', motto: "Shufflin', shufflin'" }
  , { name: 'Ringo', motto: "Make haste slowly." }
  ]
, meta: {
    year: 1999
  }
});
```
```coffeescript
page.render
  visited: true
  users: [
    { name: 'Billy', motto: "Shufflin', shufflin'" }
    { name: 'Ringo', motto: "Make haste slowly." }
  ]
  meta:
    year: 1999
```

### Output

```html
<h1>Welcome back!</h1>
<ul>
  <li>Billy: Shufflin', shufflin'</li>
  <li>Ringo: Make haste slowly</li>
</ul>
<small>Copyright &copy; 1999 Party Like It's.</small>
```

Note how in the above example, the context becomes each array item inside of
the `#each users` section. Similarly, sections set scope when referring to the
name of an object. In addition to the local scope, template tags may refer to
anything in the parent scope.

### Template

```html
<Body:>
  {{#with users.jill}}
    I like <a href="{{link}}">{{favorite}}</a>.
  {{/}}
```

### Context

```javascript
page.render({
  users: {
    jill: {
      favorite: 'turtles'
    }
  }
, link: 'http://derbyjs.com/'
});
```
```coffeescript
page.render
  users:
    jill:
      favorite: 'turtles'
  link: 'http://derbyjs.com/'
```

### Output

```html
I like <a href="http://derbyjs.com/">turtles</a>.
```

## Bindings

Model-view binding is a relatively recent approach to adding dynamic
interaction to a page. Its use of declarative syntax dramatically lowers the
amount of repetitive, error-prone DOM manipulation code in an application. With
Derby's bindings system, it should rarely be necessary to write any DOM code
at all.

Derby templates declare bindings by using single curly braces instead of double
curly braces. If a left curly brace (`{`) character is desired in HTML output,
use the HTML entity `&#123;`.

Bound template tags output their values in the initially rendered HTML just like
unbound tags. In addition, they create bindings that update the view
immediately whenever the model changes. If bindings are used for elements that
change upon user interaction---such as form inputs---Derby will update the
model automatically as their values change.

Any template tag may be live bound, except for within an `id` attribute. The id
must be set at render time and not change until the element is re-rendered,
since it is used to figure out which element to update.

Bindings only work for data in the model. Context data is passed in at render
time, and it doesn't change dynamically. If a binding tag uses a name not in
the context object or the model at render time, it is still bound to the model,
since the path may be defined later.

### Template

```html
<Body:>
  Holler: <input value="{message}"><h1>{message}</h1>
```

### Context

```javascript
model.set('message', 'Yo, dude.');
page.render();
```
```coffeescript
model.set 'message', 'Yo, dude.'
page.render()
```

### Output

```html
Holler: <input value="Yo, dude." id="$0"><h1 id="$1">Yo, dude.</h1>
```

Note that the value in the model at render time is inserted into the HTML, as with a non-bound template tag. In addition, Derby establishes an event listener for the input element that sets the value of `message` whenever the user modifies the text of the input element. It also sets up a listeners for both the input and the h1 element to update their displayed values whenever `message` changes.

Rather than re-rendering the entire template when a value changes, only the individual elements are updated. In the case of the input, its `value` property is set; in the case of the h1, its `innerHTML` is set. Since neither of these elements have an `id` attribute specified in the template, Derby automatically creates ids for them. All DOM ids created by Derby begin with a dollar sign ($). If an element already has an id, Derby will use that instead.

Derby associates all DOM event listeners with an `id`, because getting objects by id is a fast DOM operation, it makes dealing with DOM events more efficient, and event listeners continue working even if other scripts modify the DOM unexpectedly. Derby internally tracks events via ids, allowing it to render pages on the server and then re-establish the same event listeners on the client efficiently.

If a bound template tag or section is not fully contained by an HTML element, Derby will wrap the template by placing comment markers before and after the location of the template. Comments are used, because they are valid in any location. A number of HTML elements have restrictions that make it impossible to wrap a template in an additional element. For example, `<tr>` elements may only contain `<td>` and `<th>` elements.

### Template

```html
<Body:>
  Welcome to our {adjective} city!
```

### Context

```javascript
model.set('adjective', 'funny');
page.render();
```
```coffeescript
model.set 'adjective', 'funny'
page.render()
```

### Output

```html
Welcome to our <!--$0-->funny<!--$$0--> city!
```


### Relative model paths and aliases

For items in the context object, objects from the parent scope can still be referred to directly from within sections. However, bindings are set up when templates are initially compiled, and objects defined in the model may change. Thus, model paths must refer to the full path regardless of location within the template.

Yet, a template might need to define how each item in an array should be rendered as well as bind to those items. In this case, relative model paths may be used. Paths relative to the current scope begin with a dot (`.`).

### Template

```html
<Body:>
  <ul>{#each items}<app:item>{/}</ul>

<item:>
  <li><a href="{{url}}">{.name}</a>: ${.price}</li>
```

### Context

```javascript
model.set('items', [
  { name: 'Can', price: 5.99, url: '/p/0' }
, { name: 'Fin', price: 10.99, url: '/p/1' }
, { name: 'Bot', price: 24.95, url: '/p/2' }
]);
page.render();
```
```coffeescript
model.set 'items', [
  { name: 'Can', price: 5.99, url: '/p/0' }
  { name: 'Fin', price: 10.99, url: '/p/1' }
  { name: 'Bot', price: 24.95, url: '/p/2' }
]
page.render()
```

### Output

```html
<ul id="$0">
  <li><a href="/p/0" id="$1">Can</a>: $<!--$2-->5.99<!--$$2--></li>
  <li><a href="/p/1" id="$3">Fin</a>: $<!--$4-->10.99<!--$$4--></li>
  <li><a href="/p/2" id="$5">Bot</a>: $<!--$6-->24.95<!--$$6--></li>
</ul>
```

In the above example, note that the `url` is not bound, and it does not start with a dot. Since the context will be set to the array item at render time, this will render the value correctly, but it will not update if the value changes. `.name` and `.price` start with a dot, because they are bound to paths in the model relative to the item being rendered. Whenever the name or the price of an item changes, the appropriate fields will be updated in realtime. In addition, the entire list is bound. If a new item is added, an item is removed, or the items are reordered, the list will be updated in realtime.

Aliases to a specific scope may be defined, enabling relative model path references within nested sections. Aliases begin with a colon (`:`), and can be defined at the end of a section tag with the `as` keyword.

### Template

```html
<Body:>
  <h2>Toys in use:</h2>
  {#each toys as :toy}
    <div>
      {#if :toy.inUse}
        <app:toyStatus>
      {/}
    </div>
  {/}
  <h2>All toys:</h2>
  {#each toys as :toy}
    <app:toyStatus>
  {/}

<toyStatus:>
  <p>{{name}} on the {:toy.location}</p>
```

### Context

```javascript
model.set('toys', [
  { name: 'Ball', location: 'floor', inUse: true }
, { name: 'Blocks', location: 'shelf' }
, { name: 'Truck', location: 'shelf' }
]);
page.render();
```
```coffeescript
model.set 'toys', [
  { name: 'Ball', location: 'floor', inUse: true }
  { name: 'Blocks', location: 'shelf' }
  { name: 'Truck', location: 'shelf' }
]
page.render()
```

### Output

```html
<h2>Toys in use:</h2>
<!--$0-->
  <!--$1--><p>Ball on the <!--$2-->floor<!--$$2--></p><!--$$1-->
  <!--$3--><!--$$3-->
  <!--$4--><!--$$4-->
<!--$$0-->
<h2>All toys:</h2>
<!--$5-->
  <p>Ball on the <!--$6-->floor<!--$$6--></p>
  <p>Blocks on the <!--$7-->shelf<!--$$7--></p>
  <p>Truck on the <!--$8-->shelf<!--$$8--></p>
<!--$$5-->
```