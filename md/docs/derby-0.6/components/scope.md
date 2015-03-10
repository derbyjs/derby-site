# Scope

A component's model is always a decendent of the root model. 

## Child Model
All paths in a components model are scoped to it's local context. There are no collections on child models so the rules of the root model don't apply around private paths. For example `model.set("foo", "bar")` is completely valid inside a component.


## Attributes
The most direct way to get data into a component is to pass in a reference or a literal as an attribute. The type of data passed into an attribute will determine how it should be used, the following sections describe the various ways to use data passed in as an attribute.

### Scopped paths
Passing in a referrence is one of the most common ways to pass data into a component. The reference will be two-bound so updating the value in the component's model or in it's parent will trigger updates in either place.

```derby
<!-- usage -->
<view is="user-list" data="{{users}}"></view>
<!-- definition -->
<index:>
  <ul>
    {{each data as #user}}
      <li>{{#user.name}}</li>
    {{/each}}
  </ul>
```
In this case `data` is looked up in the component's model, and it points to the `users` array in the parent scope.

### Literals
All attributes set to strings will be treated as strings. This means if you want to pass a number or boolean literal to a component you must use bindings.

```derby
<!-- usage -->
<view is="thing" foo="{{true}}" numba="{{7}}"></view>
<!-- definition -->
<index:>
  {{if foo}}
    {{numba + 1}} bars!
  {{/if}}
```


### Content
A component can accept dynamic content for rendering internally. 
By default any content inside a component's declaration will be available in the `content` attribute.
```derby
<!-- usage -->
<view is="thing">
  my custom content
</view>

<!-- definition -->
<index:>
  <div>my normal content</div>
  <div>{{@content}}</div>
```

### Attributes
Beyond content, a component can be passed in custom named views as attributes. This is accomplished by specifying the attributes the component expects in its definition.

```derby
<!-- usage -->
<view is='thing'>
  <before> first! </before>
  <content>my custom content</content>
  <after> last! </after>
</view>

<!-- definition -->
<index: attributes='before after'>
  <div>{{@before}}</div>
  <div>my normal content</div>
  <div>{{@content}}
  <pre>{{@after}}</pre>
```

It is also possible to specify a keyword that will turn multiple content elements into an attribute with an array of those values.
```derby
<!-- usage -->
<view is='thing'>
  <tab>one</tab>
  <tab>two</tab>
  <tab>three</tab>
</view>

<!-- definition -->
<index: arrays='tab/tabs'>
  <div>my normal content</div>
  <ul>
    {{each @tabs as #tab}}
      <li>{{#tab}}</li>
    {{/each}}
  </ul>

<!-- alternative definition without pluralization-->
<index: arrays="tab">
  <div>my normal content</div>
  <ul>
    {{each @tab as #tab}}
      <li>{{#tab}}</li>
    {{/each}}
  </ul>
```

### Root Model
There are times when accessing data in the root model is desirable from within the component. This can be achieved both in the template and in the controller.

```derby
<index:>
  <!-- dynamically look up a user in the users collection -->
  {{#root.users[userId]}}
```

```js
  var users = this.model.root.get("users");
  var user = users[userId]
  // or
  var $users = this.model.scope("users");
  var user = $users.get(userId)
```


### With block
See the documentation for [with blocks](../views/template-syntax/blocks#with) to pass in data with an alias. 


## Attributes vs. Model data
Complex expressions that involve multiple bindings or view functions will be passed in as a template.
```derby
<view is="great" foo="{{ {x: _page.width, y: _page.height} }}" bar="{{format(_page.bar)}}"></view>
```
The definition of the component must use an `@` symbol to look up `foo` and `bar` from the components attributes:

```derby
<index:>
  <div style="top:{{@foo.y}};left:{{@foo.x}}">
    {{@bar}}
  </div>
```

This is because the `foo` and `bar` will be stored as template objects in the component's model, due to the complexity of creating the bindings in these cases.


> You can always render an attribute in your component's view using `{{@attr}}`, no matter how it is passed in. You can only use `{{attr}}` to render from the component's model if you pass in a scopped path or a literal, as Derby will handle putting those into the model for you.

This behavior might also lead to an unexpected result when trying to render from the model or programmatically accessing data from the model. In the case where your attribute is a template you can access the rendered value with the component's `getAttribute` function.

```js
// what you want
var foo = this.getAttribute("foo");
// { x: ..., y: ...}
// what you probably don't want
var template = this.model.get("foo");
```

### Getting and Setting Attributes
> `value = this.getAttribute(name)`
> * `name` the name of the attribute
> * `value` the rendered value of the attribute

> this.setAttribute(name, value)
> * `name` the name of the attribute
> * `value` the new value of the attribute.

An interactive example of interacting with attributes is available below. Notice that accessing the model using the attribute name returns a template object instead of the rendered value you might desire:

<p data-height="411" data-theme-id="12888" data-slug-hash="ByOaMm" data-default-tab="html" data-user="enjalot" class='codepen'>See the Pen <a href='http://codepen.io/enjalot/pen/ByOaMm/'>Derby-standalone attributes</a> by Ian (<a href='http://codepen.io/enjalot'>@enjalot</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

> *Note - The above example is using [derby-standalone](http://github.com/derbyjs/derby-standalone) which has a slightly different syntax for defining templates at the moment.*

