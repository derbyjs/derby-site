# View partials

This page goes into more detail about how view partials relate to components. For more general concepts, see the [template syntax](../views/template-syntax) documentation.

While a component's controller is associated with a single view, it can contain sub-views defined as view partials. Components can also accept other views passed in as attributes.

## Scope
By default a view partial inherits the scope where it is instantiated.

```derby
<index:>
  {{foo}}
  {{with #root.bar as #bar}}
    <view is="my-partial"></view>
  {{/with}}

<my-partial:>
  i can render {{foo}} and {{#bar}}
```
A view partial associated with a component follows the [component scope](scope) rules. A view partial used inside a component will inherit the scope of the component.

### extend
It is possible to override another component's functionality while preserving its view. You can do this with the `extend` keyword.

<p class="codepen" data-height="200" data-theme-id="0" data-default-tab="result" data-user="nateps" data-slug-hash="OJJXRQb"></p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>


### import
If you just want to reuse a view partial the `import` keyword is probably more appropriate. See the [namespaces and files](../views/namespaces-and-files#structuring-views-in-multiple-files) documentation for more details.


## Programmatic view management

> `view = this.getView(name)`
> * `name` the name of the view
> * `view` a template object representing the view

It is possible to access the views in a component's namespace from the controller. This may be used in conjunction with `setAttribute` to override a component's default rendering.
An example use case would be to set a default template and then allow the user of the component to pass in a template to override the default.

See the [attributes](scope#attributes-vs-model-data) documentation for more information on using `setAttribute`.


## Component tracking
Derby components are tracked in the DOM with an HTML comment tag. This allows components to be responsible for arbitrary DOM content, for example two table rows that otherwise cannot be wrapped by any other DOM elements.

```derby
<!-- namespace:component:name -->
```

## Debugging

A relatively quick way to inspect a component for debugging is to find its comment in the browser's DOM inspector.
In modern browsers, clicking on the comment allows you to reference it in the console with `$0`.
Once you have a reference to the comment tag, you can access its controller with `$0.$component` and its model data with `$0.$component.model.get()`

<img src="/images/docs/charts-debug.png">

### derby-debug
There is a plugin which makes accessing your components from the console even more accessible that is recommended for development.
Read more about [derby-debug](https://github.com/derbyjs/derby-debug).
