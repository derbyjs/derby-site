# DOM Binding

## DOM event binding

The `x-bind` attribute may be added to any HTML element to bind one or more DOM events to a controller function by name. The bound function must be exported on the app. Bound functions are passed the original event object, the element on which the `x-bind` attribute was placed, and a `next()` function that can be called to continue event bubbling.

Browsers emit DOM events on the target and then each of its parent nodes all the way up to the document's root element, unless a handler calls `e.stopPropogation()`. Derby performs event bubbling more like routes---the handler function for the target element or the first bound parent element is called and then event bubbling stops. The handler can call the `next()` function to continue bubbling the event up.

The `x-capture` attribute may be used if the handler should *always* be called whenever a child element emits a given event. This may be especially useful on the root `<html>` element for handling events like `mousemove`.

If the click event is bound on an `<a>` tag without an `href` attribute, Derby will add the attributes `href="#"` and `onclick="return false"` automatically. If the submit event is bound on a `<form>` tag, `onsubmit="return false"` will be added to prevent a default redirect action.

Event bindings can also delay the callback's execution after a timeout. This can be useful when handling events like paste, which is fired before new content is inserted. The value of the delay in milliseconds is included after the name of the event, such as `x-bind="paste/0: afterPaste"`.

Internally, Derby only binds each type of event once to the `document` and performs event delegation. It uses element ids to keep track of which elements should be bound to which events. Thus, much like with model-view bindings, Derby will add an automatically generated `id` attribute to an element that uses `x-bind` if it does not already have an id.

### Template

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

### Template

```html
<Body:>
  <ul>
    {#each _page.users}
      <li x-bind="click: upcase">{.name}</li>
    {/}
  </ul>
```

### App

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
