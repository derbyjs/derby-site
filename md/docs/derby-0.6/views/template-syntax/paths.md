# Paths

Template paths use JavaScript syntax with a few small modifications.

## Model values

What would be identifiers for variable names in JavaScript get a value from the model and bind to any updates. If the path returns null or undefined, nothing is rendered.

Examples of rendering model values:

```derby
{{user.name}}

{{user.bestFriends[0].name}}

{{users[userId].name}}
```

```js
model.get('user.name');

model.get('user.bestFriends.0.name');

var userId = model.get('userId');
model.get('users.' + userId);
```

The `unescaped` keyword may be used to render HTML without escaping. This should *very rarely* be used in practice. There are many ways of dynamically creating views, and unescaped HTML is unsafe, is typically slower, and is rarely the best way to do things in Derby.

```derby
<!-- Avoid unescaped HTML unless you really know what you are doing -->
<div>{{unescaped rawHtml}}</div>
```

## Relative paths

Relative view paths begin with `this`. They refer to the expression in the containing block:

```derby
{{with user}}
  <h1>{{this.name}}</h1>
  <h2>{{this.headline}}</h2>
  {{if this.friendList}}
    <h3>Friends</h3>
    <ul>
      {{each this}}
        <li>{{this.name}}</li>
      {{/each}}
    </ul>
  {{/if}}
{{/with}}
```

## Aliases

Aliases label path expressions. They must begin with a hash (`#`) character to make it more obvious whether a path is an alias or a model value. Each of the block types support defining aliases with the `as` keyword.

Aliases are more explicit than relative paths and make it possible to refer to the scope of a parent block.

```derby
{{with user as #user}}
  <h1>{{#user.name}}</h1>
  <h2>{{#user.headline}}</h2>
  {{if #user.friendList as #friendList}}
    <!-- Note that we can refer to the parent scope -->
    <h3>Friends of {{#user.name}}</h3>
    <ul>
      {{each #friendList as #friend}}
        <li>{{#friend.name}}</li>
      {{/each}}
    </ul>
  {{/if}}
{{/with}}
```

## Attributes

Views can be passed values as attributes. These attributes are accessed via paths that start with an at sign (`@`). By default, there is an `@content`
attribute for the content within the view tag.

```derby
<Body:>
  <ul class="nav-links">
    <view is="nav-link" href="/">Home</view>
    <view is="nav-link" href="/about">About us</view>
  </ul>

<nav-link:>
  <li>
    {{if $render.url === @href}}
      <b>{{@content}}</b>
    {{else}}
      <a href="{{@href}}">{{@content}}</a>
    {{/if}}
  </li>
```
