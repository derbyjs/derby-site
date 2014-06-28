# Views

Typically, writing Derby apps begins with HTML templates. These templates define
the rendered HTML as well as model-view bindings.

## Creating templates

Derby compiles a collection of HTML-based templates into a page based on a
number of pre-defined names. Pages usually define at least a `Title` and `Body`
template. Templates may be created programmatically via the `view.make()`
method:

```javascript
var view = require('derby').createApp(module).view;

view.make('Body', '<h1>Howdy!</h1>');
```

```coffeescript
{view} = require('derby').createApp module

view.make 'Body', '<h1>Howdy!</h1>'
```

However, they are generally placed in template files within the `views`
directory. Each app automatically looks for a template file that shares the
same name and calls view.make for each template. Templates placed in a template
file are also automatically bundled with the application scripts so that they
can be rendered on the client.

Template files are also HTML, but each template is wrapped in a tag that names
the template. This name must end in a colon to differentiate it from a normal
HTML tag. These tags need not be closed. For example:

```html
<Title:>
  Silly example

<Body:>
  <h1>Howdy!</h1>
```

### Pre-defined templates

By default, Derby includes templates with the names `Doctype`, `Root`,
`Charset`, `Title`, `Head`, `Header`, `Body`, `Footer`, `Scripts`, and `Tail`
when it renders a page on the server.

In the browser, only the `Root`, `Title`, `Header`, `Body`, and `Footer`
templates are re-rendered. Thus, model-view bindings may only be defined within
these templates.

Some of pre-defined templates have names that also are the names of HTML tags,
but only `Title` wraps the template inside of a `<title>` tag. Derby does *not*
include any non-required HTML elements, such as `<html>`, `<head>`, and
`<body>` by default.

By convention, Pre-defined template names are capitalized to indicate that the
page renderer will include them automatically. However, since HTML tags are
case-insensitive, Derby template names are also case insensitive. Thus, `Body`,
`BODY`, and `body` all represent the same template.

Note that template files don't contain boilerplate HTML, such as doctype
definitions, stylesheets, and script includes. By default, Derby includes these
items in an order optimized for fast load times. Also to optimize load time, it
sends pages a number of chunks:

#### First chunk

1. **`Doctype:`** Standard HTML5 doctype---`<!DOCTYPE html>`---unless overridden
2. **`Root:`** Optional location for an `<html>` element if desired. This template should not include any other elements
3. **`Charset:`** `<meta charset=utf-8>` unless overridden
4. **`Title:`** The text content of the page's `<title>` element
5. **`Head:`** Optional location for meta tags, scripts that must be placed in the HTML `<head>`, and manually included stylesheets
6. CSS is compiled and inserted after the Head template automatically
7. **`Header:`** Optional location for a page header that will be sent with the initial response chunk. Note that this is actually part of the HTML `<body>`, but it should render correctly by itself. It is separated out so that it can be displayed to the user before the rest of the page if the remainder of the page takes a while to download. Typically this includes fixed content, such as a logo and a top navigation bar

#### Second chunk

8. **`Body:`** The page's main content
9. **`Footer:`** Optional location for content to include after the body. Used for copyright notices, footer links, and other content repeated at the bottom of multiple pages

#### Third chunk

10. Inline scripts can be added via the `view.inline()` method. Scripts are typically included this way if they are needed to properly render the page, such as resizing an element based on the window size
11. **`Scripts:`** Optional location for external scripts loaded before the client scripts. Note that this template is just a location within the page, and it is not wrapped in a script tag
12. Client scripts are automatically included via an asynchronously loaded external script
13. JSON bundle of the model data, event bindings, and other data resulting
from rendering the page. This bundle initializes the application once the
external client script loads.
14. **`Tail:`** Optional location for additional scripts to be included at the very end of the page

<style>
ol{counter-reset: item}
ol>li{display: block}
ol>li:before{content: counter(item) ". "; counter-increment: item}
#second_chunk+ol{counter-reset: item 7}
#third_chunk+ol{counter-reset: item 9}
</style>

### Importing templates

Each view template file **must** be explicitly imported, starting from the
main index.html file for an app.

File paths are expressed relatively, similar to how Node.js modules are loaded.
Like in Node.js modules, either `pageName.html` or `pageName/index.html` can be
imported as `pageName`.

```html
<!-- all templates from "./home.html" with the namespace "home" -->
<import: src="home">

<!-- all templates from "./home.html" into the current namespace -->
<import: src="home" ns="">

<!-- one or more specific templates with the namespace "home" -->
<import: src="home" template="message alert">

<!-- one template as a different name in the current namespace -->
<import: src="home" template="message" as="myMessage">
```

Templates defined in a parent namespace are inherited unless they are
overridden by a template with the same name in the child namespace. Thus, it
often makes sense to place common page elements in a main file that imports a
number of other files and override the part of the page that is different.

Template components are referenced relative to their current namespace.
Namespaces are separated by colons, and a namespace can be passed to the
`page.render()` method to render a specific page or application state.

Note that passing a namespace to `page.render()` **does not** cause a template
file to be loaded by filename. All of the app's templates are loaded at once, so
that they can be packaged up to render any page in the browser. It happens to be
that a namespace usually has the same name as the file, because the `<import:>`
tag uses the filename as the default namespace. However, every file must be
explicitly imported, starting at the app's main index.html file.

#### shared.html
```html
<profile:>
  <div class="profile">
    ...
  </div>
```

#### home.html
```html
<import: src="shared">

<Body:>
  Welcome to the home page
  <!-- include component from an imported namespace -->
  <app:shared:profile>
```

#### index.html
```html
<import: src="home">
<import: src="contact">
<import: src="about">

<Body:>
  Default page content

<Footer:>
  <p><small>&copy; {{year}}</small></p>
```

#### Context
```javascript
page.render('home', {
  year: 2012
});
```
```coffeescript
page.render 'home',
  year: 2012
```

See [Components](#components) for more info on defining template components.

## Template syntax

Derby's template syntax is largely based on
[Handlebars](http://handlebarsjs.com/), a popular semantic templating
language similar to [Mustache](http://mustache.github.com/mustache.5.html).

If you use Sublime Text 2 or TextMate, you can use [our fork of the HTML5
bundle](https://github.com/codeparty/html5.tmbundle) to get proper
syntax highlighting of Derby templates. You might want to also try our [Clean
color theme](https://github.com/codeparty/clean-textmate), which
highlights each type of template tag appropriately.

A simple Handlebars template:

```html
    Hello {{name}}
    You have just won ${{value}}!
    {{#if inCalifornia}}
        Well, ${{taxedValue}}, after taxes.
    {{/if}}
```

Given the following data context:

```javascript
    {
        name: "Chris",
        value: 10000,
        taxedValue: 10000 - (10000 * 0.4),
        inCalifornia: true
    }
```

Will produce the following:

```html
    Hello Chris
    You have just won $10000!
    Well, $6000.0, after taxes.
```

Semantic templates better enforce separation of logic from presentation by
restricting the ability to embed logic within views. Instead of conditional
statements and loops, there is a small set of template tags. During rendering,
data are passed to the template, and template tags are replaced with the
appropriate values. This data is often referred to as the "context."

With Handlebars, application code generates a context object before rendering
the view. It then passes that object along with the template at render time.
Derby templates can be used this way as well. However, in addition to looking
for objects in a context object, Derby assumes that the model is part of the
context. Even better, Derby is able to automatically establish live bindings
between the view and objects in the model. Derby slightly extends the
Handlebars syntax in order to support these features.

The other major difference between Handlebars and Derby templates is that Derby
templates must be valid HTML first. Handlebars is language agnostic---it can be
used to compile anything from HTML to source code to a document. However, Derby
templates are first parsed as HTML so that the parser can understand how to
bind data to the surrounding DOM objects. Template tags are only allowed within
elements or text, within attribute values, and surrounding elements.

#### Invalid template tag placements
```html
<!-- INVALID: Within element names -->
<{{tagName}}>Bad boy!</{{tagName}}>

<!-- INVALID: Within attribute names -->
<b {{attrName}}="confused" {{booleanAttr}}>Bad boy!</b>

<!-- INVALID: Splitting an html tag -->
<b{{#if maybe}}>Bad boy!</b{{/}}>

<!-- INVALID: Splitting an element -->
{{#if maybe}}<b>{{/}}Bad boy!</b>
```

#### Valid placements
```html
<!-- Within an element -->
Let's go <b>{{activity}}</b>!

<!-- Within text -->
<b>Let's go {{activity}}!</b>

<!-- Within attribute values -->
<b style="color:{{displayColor}}">Let's go running!</b>

<!-- Surrounding one or more elements and text -->
{{#if maybe}}<b>Let's go dancing!</b>{{/}}
```

### Whitespace and HTML conformance

Before parsing, all HTML comments, leading and trailing whitespace, and new
lines are removed from templates. This reduces page size, and it keeps template
code more readable when spaces are not desired between inline elements. If you
do want whitespace at the beginning or end or a line, add the non-standard `&sp;`
character entity, which will simply be replaced with a space.

The contents of `<script>` and `<style>` tags are passed through literally,
except for whitespace removal. This whitespace removal can be disabled within
an element by adding an `x-no-minify` attribute.

```html
<script type="application/x-yaml" x-no-minify>
  firstName: Sam
  lastName : Reed
</script>
```

Derby's HTML parser should be able to parse any valid HTML, including elements
that don't require closing tags and unquoted attributes. However, it is
recommended that you **always include closing tags** for elements like `<p>`
and `<li>` that might not require a closing tag. The rules around how tags are
automatically closed are complex, and there are certain cases where template
sections may be included within an unexpected element.

HTML attribute values only need to be quoted if they are the empty string or if
they contain a space, equals sign, or greater than sign. Since Derby templates
are parsed as HTML first, any of these characters within a template tag require
an attribute to be escaped. Using **quotes around all attribute values** is
recommended.

Because it understands the HTML context, Derby's HTML escaping is more
minimal than that of many templating libraries. You may be surprised to see
unescaped `>` and `&` characters. These only need to be escaped in certain
contexts, and Derby only escapes them when needed. If you are skeptical, an
[HTML5 validator](http://html5.validator.nu/) will detect most escaping bugs.

Throughout these docs, the output of templates is shown indented and on
multiple lines for the sake of readability. However, Derby's renderer would not
output any indentation or line breaks. In addition, output attribute values are
quoted, but Derby only includes quotes around attribute values if they are
needed.

### Variables

Variables insert a value from the context or model with a given name. If the
name isn't found, nothing will be inserted. Values are HTML escaped by default.
The `unescaped` keyword may be used to insert a value without escaping.

#### Template

```html
<Body:>
  <p>{{name}}</p>
  <p>{{age}}</p>
  <p>{{location}}</p>
  <p>{{unescaped location}}</p>
```

#### Context

```javascript
page.render({ name: 'Parker', location: '<b>500 ft</b> away' });
```
```coffeescript
page.render name: 'Parker', location: '<b>500 ft</b> away'
```

#### Output

```html
<p>Parker</p>
<p></p>
<p>&lt;b>500 ft&lt;/b> away</p>
<p><b>500 ft</b> away</p>
```

### Sections

Sections set the scope of the context for their contents. In the case of `if`,
`unless`, `else if`, `else`, and `each`, they also cause their contents to be
conditionally rendered. `with` is used to only set the scope and always render.
In Handlebars, sections begin and end with the same block type, but Derby
requires only an ending slash.

As in Handlebars, falsey values include all falsey JavaScript values (`false`,
`null`, `undefined`, `0`, `''`, and `NaN`) as well as empty arrays (`[]`). All
other values are truthy.

#### Template

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

#### Context

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

#### Output

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

#### Template

```html
<Body:>
  {{#with users.jill}}
    I like <a href="{{link}}">{{favorite}}</a>.
  {{/}}
```

#### Context

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

#### Output

```html
I like <a href="http://derbyjs.com/">turtles</a>.
```

### Bindings

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

#### Template

```html
<Body:>
  Holler: <input value="{message}"><h1>{message}</h1>
```

#### Context

```javascript
model.set('message', 'Yo, dude.');
page.render();
```
```coffeescript
model.set 'message', 'Yo, dude.'
page.render()
```

#### Output

```html
Holler: <input value="Yo, dude." id="$0"><h1 id="$1">Yo, dude.</h1>
```

Note that the value in the model at render time is inserted into the HTML, as with a non-bound template tag. In addition, Derby establishes an event listener for the input element that sets the value of `message` whenever the user modifies the text of the input element. It also sets up a listeners for both the input and the h1 element to update their displayed values whenever `message` changes.

Rather than re-rendering the entire template when a value changes, only the individual elements are updated. In the case of the input, its `value` property is set; in the case of the h1, its `innerHTML` is set. Since neither of these elements have an `id` attribute specified in the template, Derby automatically creates ids for them. All DOM ids created by Derby begin with a dollar sign ($). If an element already has an id, Derby will use that instead.

Derby associates all DOM event listeners with an `id`, because getting objects by id is a fast DOM operation, it makes dealing with DOM events more efficient, and event listeners continue working even if other scripts modify the DOM unexpectedly. Derby internally tracks events via ids, allowing it to render pages on the server and then re-establish the same event listeners on the client efficiently.

If a bound template tag or section is not fully contained by an HTML element, Derby will wrap the template by placing comment markers before and after the location of the template. Comments are used, because they are valid in any location. A number of HTML elements have restrictions that make it impossible to wrap a template in an additional element. For example, `<tr>` elements may only contain `<td>` and `<th>` elements.

#### Template

```html
<Body:>
  Welcome to our {adjective} city!
```

#### Context

```javascript
model.set('adjective', 'funny');
page.render();
```
```coffeescript
model.set 'adjective', 'funny'
page.render()
```

#### Output

```html
Welcome to our <!--$0-->funny<!--$$0--> city!
```


### Relative model paths and aliases

For items in the context object, objects from the parent scope can still be referred to directly from within sections. However, bindings are set up when templates are initially compiled, and objects defined in the model may change. Thus, model paths must refer to the full path regardless of location within the template.

Yet, a template might need to define how each item in an array should be rendered as well as bind to those items. In this case, relative model paths may be used. Paths relative to the current scope begin with a dot (`.`).

#### Template

```html
<Body:>
  <ul>{#each items}<app:item>{/}</ul>

<item:>
  <li><a href="{{url}}">{.name}</a>: ${.price}</li>
```

#### Context

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

#### Output

```html
<ul id="$0">
  <li><a href="/p/0" id="$1">Can</a>: $<!--$2-->5.99<!--$$2--></li>
  <li><a href="/p/1" id="$3">Fin</a>: $<!--$4-->10.99<!--$$4--></li>
  <li><a href="/p/2" id="$5">Bot</a>: $<!--$6-->24.95<!--$$6--></li>
</ul>
```

In the above example, note that the `url` is not bound, and it does not start with a dot. Since the context will be set to the array item at render time, this will render the value correctly, but it will not update if the value changes. `.name` and `.price` start with a dot, because they are bound to paths in the model relative to the item being rendered. Whenever the name or the price of an item changes, the appropriate fields will be updated in realtime. In addition, the entire list is bound. If a new item is added, an item is removed, or the items are reordered, the list will be updated in realtime.

Aliases to a specific scope may be defined, enabling relative model path references within nested sections. Aliases begin with a colon (`:`), and can be defined at the end of a section tag with the `as` keyword.

#### Template

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

#### Context

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

#### Output

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

### View helper functions

Derby follows the semantic templating approach of Handlebars and Mustache, which helps to reduce bleeding of logic into templates. However, because of Derby's automatic bindings between the view and model, it can be useful to have computed values that are created only for the view.

View helper functions are reactive, and they are evaluated when rendering as well as whenever any bound inputs change. In addition, they can work as both getters and setters. This is especially useful when binding to form elements, such as selected options or radio buttons:

#### Controller

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

#### Template

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

#### Defaul view helper functions

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

## Components

Components are similar to Handlebars partials, but they are much more powerful. Like partials, they inherit the scope of the parent context where they are used. In addition, Derby's components let you supply additional arguments as attributes and HTML content. Both for code readability and for more efficient template compilation, it is best to keep individual templates relatively simple and use components for each significant unit.

Any Derby template can be used as a component. They are included like custom HTML tags with a special namespace. Components defined within an app are all accessed from the `app` namespace.

#### Template

```html
<Body:>
  <app:nav>

<nav:>
  <ul>{{each navItems}}<app:navItem>{{/}}</ul>

<navItem:>
  <li><a href="{{link}}">{{title}}</a></li>
```

#### Context

```javascript
page.render({
  navItems: [
    { title: 'Home', link '/' }
  , { title: 'About', link '/about' }
  , { title: 'Contact us', link '/contact' }
  ]
});
```
```coffeescript
page.render
  navItems: [
    { title: 'Home', link '/' }
    { title: 'About', link '/about' }
    { title: 'Contact us', link '/contact' }
  ]
```

#### Output

```html
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="/about">About</a></li>
  <li><a href="/contact">Contact us</a></li>
</ul>
```

Literal values or variable values can be passed to components. These component attributes are available in template tags, prefixed with an `@` character.

```html
<Body:>
  <h1><app:greeting message="Hello" to="{_page.user.name}"></h1>

<greeting:>
  {#if @to}
    {{@message}}, {@to}!
  {else}
    {{@message}}!
  {/}
```

produces the same output as:

```html
<Body:>
  <h1>
    {#if _page.user.name}
      Hello, {_page.user.name}!
    {else}
      Hello!
    {/}
  </h1>
```

By default, all components are void HTML elements. This means that they must only have an opening tag and no closing tag, just like the `<img>` and `<br>` elements. A component can be defined as nonvoid, which means that it must have both a starting and a closing tag. Nonvoid components have access to a special `content` attribute that makes it possible to pass HTML content to the component. For example:

```html
<Body:>
  Welcome!
  <app:fancyButton>
    <b>Click me{{#if isUrgent}} now!{{/}}</b>
  </app:fancyButton>

<fancyButton: nonvoid>
  <button class="fancy">
    {{@content}}
  </button>
```

produces the same output as:

```html
<Body:>
  Welcome!
  <button class="fancy">
    <b>Click me{{#if isUrgent}} now!{{/}}</b>
  </button>
```

### Component libraries

Documentation is forthcoming. Until then, please see the [Widgets example](https://github.com/codeparty/derby-examples/tree/master/widgets) for usage and the [Boot source](https://github.com/codeparty/derby-ui-boot).

## HTML extensions

Derby provides a few extensions to HTML that make it easier to bind models and views.

Custom attributes used during template parsing start with the prefix `x-` to avoid conflicts with future extensions to HTML. Note that Derby uses this prefix instead of `data-`, since that prefix is intended for custom data attributes that are included in the DOM. Derby removes `x-` attributes as it parses, and the output HTML does not include these non-standard attributes.

### DOM event binding

The `x-bind` attribute may be added to any HTML element to bind one or more DOM events to a controller function by name. The bound function must be exported on the app. Bound functions are passed the original event object, the element on which the `x-bind` attribute was placed, and a `next()` function that can be called to continue event bubbling.

Browsers emit DOM events on the target and then each of its parent nodes all the way up to the document's root element, unless a handler calls `e.stopPropogation()`. Derby performs event bubbling more like routes---the handler function for the target element or the first bound parent element is called and then event bubbling stops. The handler can call the `next()` function to continue bubbling the event up.

The `x-capture` attribute may be used if the handler should *always* be called whenever a child element emits a given event. This may be especially useful on the root `<html>` element for handling events like `mousemove`.

If the click event is bound on an `<a>` tag without an `href` attribute, Derby will add the attributes `href="#"` and `onclick="return false"` automatically. If the submit event is bound on a `<form>` tag, `onsubmit="return false"` will be added to prevent a default redirect action.

Event bindings can also delay the callback's execution after a timeout. This can be useful when handling events like paste, which is fired before new content is inserted. The value of the delay in milliseconds is included after the name of the event, such as `x-bind="paste/0: afterPaste"`.

Internally, Derby only binds each type of event once to the `document` and performs event delegation. It uses element ids to keep track of which elements should be bound to which events. Thus, much like with model-view bindings, Derby will add an automatically generated `id` attribute to an element that uses `x-bind` if it does not already have an id.

#### Template

```html
<Root:>
  <!-- always called regardless of event bubbling -->
  <html x-capture="mousemove: move">

<Body:>
  <button x-bind="click: start">Start</button>

  <!-- href="#" and onclick="return false" will be added -->
  <a x-bind="click: cancel">Cancel</a>

  <!-- onsubmit="return false" will be added -->
  <form x-bind="submit: search"> </form>

  <!-- Multiple events on one element -->
  <img src="example.png" x-bind="mousedown: down, mouseup: up">

  <!-- Wait for timeout of 50ms before calling back -->
  <input x-bind="paste/50: afterPaste">
```

It is often useful to relate back a DOM element to the model path that was used to render the item. For example, one might want to remove an item from a list when a button is clicked. Derby extends the `model.at()` method to accept a DOM node or jQuery object. When passed one of these, the method will return a [scoped model](#scoped_models) that is scoped to the context of the closest bound path in the template.

#### Template

```html
<Body:>
  <ul>
    {#each _page.users}
      <li x-bind="click: upcase">{.name}</li>
    {/}
  </ul>
```

#### App

```javascript
exports.upcase = function (e, el, next) {
  user = model.at(el);

  // Logs something like "_page.users.3"
  console.log(user.path());

  user.set('name', user.get('name').toUpperCase());
}
```
```coffeescript
exports.upcase = (e, el, next) ->
  user = model.at el

  # Logs something like "_page.users.3"
  console.log user.path()

  user.set 'name', user.get('name').toUpperCase()
```

### Boolean attributes

In HTML, boolean attributes are true when they are included and false when they are excluded. Since Derby only allows template tags inside attribute values, this makes it difficult to bind such attributes to model objects. Therefore, Derby uses a slightly modified syntax that works more naturally with the templating syntax for the attributes `checked`, `selected`, and `disabled`, which are likely to be bound to data.

Boolean attribute values can be inverted via the built-in view helper function `not()`.

```html
<Body:>
  <!-- Outputs:
    <input type="checkbox" checked>
    - or -
    <input type="checkbox">
  -->
  <input type="checkbox" checked="{{active}}">

  <!-- Bound to model -->
  <input type="checkbox" checked="{active}">

  <!-- Inverted value -->
  <input type="checkbox" disabled="{not(active)}">
```

### Form elements

Binding the selected attribute of `<option>` elements in a `<select>` is difficult, because the `change` event is only fired on the `<select>` element, and the `selected` attribute must be place on the options. Therefore, Derby distributes the change event to each of the children of a select element, raising the event on each of the options as well. This makes it possible to bind the selected state on each of the options.

For radio buttons, change events are only fired on the element that is clicked. However, clicking a radio button unchecks the value of all other radio buttons with the same name. Thus, Derby also emits the change event on other elements with the same name so that each radio button's checked attribute may be bound.

## Stylesheets

Derby uses **[Stylus](http://learnboost.github.com/stylus/)** and/or **[LESS](http://lesscss.org/)** to automatically compile and includes styles for each page. Both of these languages extend CSS with variables, mixins, functions, and other awesome features.

Derby also includes **[Nib](http://visionmedia.github.com/nib/)** with Stylus, which adds a number of convenient CSS3 mixins. Nib takes care of adding vendor prefixes, makes CSS gradients *much* easier, and has bunch of other useful features.

Stylus requires that files end in a `.styl` extension. It supports [importing other files](http://learnboost.github.com/stylus/docs/import.html), including support for `index.styl` files. Since Node.js, Derby templates, and Stylus all support similar file importing conventions, it is easy to use the same directory structure for analogous files in the `lib`/`src`, `views`, and `styles` directories.

Derby includes compiled CSS at the top of each page. Inlining CSS almost always decreases load time, and Stylus or LESS importing makes it easy to break up shared styles into files included in the appropriate pages. Note, however, that it is not optimal to include a very large amount of CSS, such as large data URI encoded images, at the top of the page. Large images are best loaded as separate files or inline at the bottom of the page, so that the rest of the page may be displayed first.

## Rendering

Views are rendered in response to [routes](#routes). Most routes should be defined inside of an app so that they can be handled both on the client and the server. Views can also be rendered in response to server only routes.

In each render method, `namespace`, `model`, `context`, and `status` arguments may be in any order or omitted.

> ### page.render` ( [namespace], [context], [status] )`
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Object specifying additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default. Has no effect when rendering on the client.

App routes supply a page object, which provides a consistent interface for rendering an entire page on both server and client. On the server, the page is rendered by calling Node.js response object methods like `res.write`. On the client, Derby renders the page locally. It then replaces the `document.title` and `document.body.innerHTML`, and updates the URL with `history.pushState`.

The page's render function implicitly renders in the context of the app's model. An additional context object may be supplied for items that are only needed at render time.

> ### app.render` ( res, model, [namespace], [context], [status] )`
>
> **res:** Response object passed to the Express routing callback
>
> **model:** A Derby model object used for rendering. The contents of the model will be serialized and initialized into the same state in the browser once the page loads.
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default.

Apps may also be rendered within server only Express routes. In this case, it is necessary to provide the renderer with a response object and model. When using the store.modelMiddleware, the model for a request is retrieved from `req.getModel()`. Otherwise, models can be made directly from the store via the `store.createModel()` method.

> ### staticPages.render` ( name, res, [model], [namespace], [context], [status] )`
>
> **name:** Name of the view and style files to render
>
> **res:** Response object passed to the Express routing callback
>
> **model:** *(optional)* A Derby model object. A model object may be used for rendering, but it will not be serialized and included with a static page. Static pages don't have an associated app, and they don't include scripts by default.
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default.

For creating error pages and other static pages, Derby provides a `staticPages` object that renders a template and script file specified by name. Typically, this is used without a model object, but it is possible to supply a model object that is used for rendering only. See [Static pages](#static_pages).

## app.view

Derby adds an `app.view` object for creating and rendering views.

> ### view.make` ( name, template )`
>
> **name:** Name of the template
>
> **template:** A string containing the Derby template. Note that this should be only the content of the template, and it should not have a template name element, such as `<Body:>` at the start.

Apps should typically place all templates in a template file in the `views` folder instead of calling `view.make()` directly. However, templates may be added to an app this way as well.

Note that calling `view.make()` only renders the template; it does not include the template in the external script file separately. Thus, it must be called again on the client when the app loads.

> ### view.inline` ( fn )`
>
> **fn:** Function to be inlined in the page and called immediately when the page loads.

This method is intended solely for server use and has no effect when called in the browser.

Scripts should be included inline in the page if needed to properly render the page. For example, a script might adjust the layout based on the window size, or it might autofocus a sign in box in browsers that don't support the HTML5 autofocus attribute.

Usually, it is preferable to place such scripts in a separate file called `inline.js` in the same directory as the app. This file will be automatically inlined when the app is created. Calling `view.inline()` directly does the same thing, but it is redundant to send the script inline and also include it in the app's external script file.