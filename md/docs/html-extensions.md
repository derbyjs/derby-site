# HTML extensions

Derby provides a few extensions to HTML that make it easier to bind models and views.

## Extensions

Custom attributes used during template parsing start with the prefix `x-` to avoid conflicts with future extensions to HTML. Note that Derby uses this prefix instead of `data-`, since that prefix is intended for custom data attributes that are included in the DOM. Derby removes `x-` attributes as it parses, and the output HTML does not include these non-standard attributes.

## Boolean attributes

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

## Form elements

Binding the selected attribute of `<option>` elements in a `<select>` is difficult, because the `change` event is only fired on the `<select>` element, and the `selected` attribute must be place on the options. Therefore, Derby distributes the change event to each of the children of a select element, raising the event on each of the options as well. This makes it possible to bind the selected state on each of the options.

For radio buttons, change events are only fired on the element that is clicked. However, clicking a radio button unchecks the value of all other radio buttons with the same name. Thus, Derby also emits the change event on other elements with the same name so that each radio button's checked attribute may be bound.

