# Functions

Functions defined on a property of a controller can be invoked from view expressions or in response to events. As a general pattern, paths refer to the model when getting values and to the controller when calling functions.

## Controller property lookup

Functions are looked up on the current component's controller, the page, and the global, in that order. The majority of functions are defined on component prototypes, generic shared utility functions are defined on the page prototype, and the global provides access to functions like `new Date()` and `console.log()`.

```derby
<!-- Call component method -->
<button on-click="delUser(#user.id)"></button>
<!-- Call utility function on page -->
{{sum(1, 2, 4)}}
<!-- Call method of global -->
{{console.log('rendering value', value)}}
```

```js
<!-- component prototypes are where most functions are defined -->
UserList.prototype.delUser = function(userId) {
  this.users.del(userId);
};

<!-- app.proto is the prototype for all pages created by the app -->
app.proto.sum = function() {
  var sum = 0;
  for (var i = 0; i < arguments.length; i++) {
    sum += arguments[i];
  }
  return sum;
};
```

## DOM Event arguments

For functions invoked by DOM events only, the special arguments `$event` or `$element` may be specified. The `$event` argument is the DOM Event object passed to the listener function for `addEventListener()`. The `$element` argument is a reference to the element on which the listener attribute is specified. These arguments are only passed to functions if explicitly specified.

```derby
<table>
  <tbody>
    {{each rows as #row}}
      <tr on-click="clickRow($event, $element)">
        <td><a href="{{#row.href}}">{{#row.name}}</a></td>
        <td>{{#row.description}}</td>
      </tr>
    {{/each}}
  </tbody>
</table>
```

```js
UserList.prototype.clickRow = function(e, tr) {
  // Ignore clicks on or in links
  var node = e.target;
  while (node && node !== tr) {
    if (node.tagName === 'A') return;
    node = node.parentNode;
  }
  // Cancel the original click event inside of the row
  e.stopPropagation();
  // Pretend like the click happened on the first link in the row
  var event = new MouseEvent('click', e);
  var link = tr.querySelector('a');
  if (link) link.dispatchEvent(event);
};
```

## Scoped model arguments

Functions can be passed the value of any view path. In some cases, it can be convenient to get a [scoped model](../../model/paths#scoped-models) to the view name instead. To pass a scoped model, you can wrap the view path in `$at()`. Instead of getting the value for a view path, this will return a scoped model. It will return undefined if no scoped model can be created for a view path.

```derby
<button on-click="toggle($at(showDetail))"></button>
```

```js
app.proto.toggle = function(scoped) {
  scoped.set(!scoped.get());
};
```
