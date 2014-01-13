# Component

Reusable chunk of template and logic

## Component libraries

Documentation is forthcoming. Until then, please see the [Widgets example](https://github.com/codeparty/derby-examples/tree/master/widgets) for usage and the [Boot source](https://github.com/codeparty/derby-ui-boot).

## Components

Components are similar to Handlebars partials, but they are much more powerful. Like partials, they inherit the scope of the parent context where they are used. In addition, Derby's components let you supply additional arguments as attributes and HTML content. Both for code readability and for more efficient template compilation, it is best to keep individual templates relatively simple and use components for each significant unit.

Any Derby template can be used as a component. They are included like custom HTML tags with a special namespace. Components defined within an app are all accessed from the `app` namespace.

### Template

```html
<Body:>
  <app:nav>

<nav:>
  <ul>{{each navItems}}<app:navItem>{{/}}</ul>

<navItem:>
  <li><a href="{{link}}">{{title}}</a></li>
```

### Context

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

### Output

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

## Components

Components are views with self-contained JavaScript functionality. They enable creating reusable UI pieces, similar to creating custom HTML elements. In addition, they are the recommended way to break up complex applications into modular parts. It's helpful to break up application features into components, even if only used in a single place.

Each component has a scoped model in its own namespace. Data or references to the containing model are passed in via view attributes. This structure is similar to the Model View ViewModel (MVVM) pattern, where a component's scoped model is essentially a ViewModel.

## Tabs Example

```
<Body:>
  <tabs>
    <pane title="One">
      <p>Some stuff here</p>
    </pane>
    <pane title="Two">
      <p>More stuff</p>
    </pane>
  </tabs>
```

```
// Use component published as module
app.component(require('d-tabs'));

// Associate component with view already registered in app
app.component('tabs', require('./tabs'));
```

### tabs.html
```
<tabs: arrays="pane" element="tabs">
  <ul class="tabs-nav">
    {{each @pane as #pane, #i}}
      <li class="{{if selectedIndex === #i}}active{{/if}}">
        <a on="click: select(#i)">{{#pane.title}}</a>
      </li>
    {{/each}}
  </ul>
  {{each @pane as #pane, #i}}
    <div class="tabs-pane{{if selectedIndex === #i}} active{{/if}}">
      {{#pane.content}}
    </div>
  {{/each}}
```

### tabs.styl
```
.tabs-nav
  list-style: none
  >li
    display: inline-block
.tabs-pane
  display: none
  &.active
    display: block
```

### tabs.js
```
module.exports = Tabs;

function Tabs() {}
Tabs.prototype.view = __dirname + '/tabs.html';
Tabs.prototype.style = __dirname + '/tabs.styl';

Tabs.prototype.init = function(model) {
  model.setNull('selectedIndex', 0);
}

Tabs.prototype.select = function(pane, e) {
  this.model.set('currentPane', pane);
};
```

### tabs.coffee
```
module.exports = class Tabs
  view: __dirname + '/tabs.html'
  style: __dirname + '/tabs.styl'

  init: (model) ->
    model.setNull 'selectedIndex', 0

  select: (pane, e) ->
    @model.set 'currentPane', pane
```

## Todos example

```
<Body:>
  <view
    name="todos-new"
    on="submit: list.add()"
    label="Add todo"
    autofocus>
  </view>
  <view
    name="todos-list"
    as="list"
    items="{{_page.items}}">
  </view>

<todos-new:>
  <form on="submit: submit()">
    <input type="text" value="{{value}}" placeholder="{{@placeholder}}" autofocus="{{@autofocus}}">
    <button type="submit">{{@label}}</button>
  </form>

<todos-list:>
  <ul>
    {{each @items as #item, #i}}
      <li>
        <input type="checkbox" checked="{{#item.checked}}">
        {{#item.text}}
        <button type="button" on="click: remove(#i)">Delete</button>
      </li>
    {{/each}}
  </ul>
```

```
app.component 'todos-new', class TodosNew
  submit: ->
    value = @model.del 'value'
    @emit 'submit', value

app.component 'todos-list', class TodosList
  add: (text) ->
    @model.push 'list', {text}
  remove: (index) ->
    @model.remove 'list', index
```
