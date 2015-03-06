# View partials

A component is created by associating a controller with a view, this page goes into more detail about how view partials relate to components. For more general concepts see the [template syntax](../views/template-syntax) documentation.

While a component's controller is associated with a single view, it can contain sub-views defined as view partials. Components can also accept other views passed in as attributes.

## Scope
By default a view partial inherits the scope where it is instanciated.  

```derby
<index:>
  {{foo}}
  {{with #root.bar as #bar}}
    <view is="my-partial"></view>
  {{/with}}

<my-partial:>
  i can render {{foo}} and {{#bar}}
```
A view partial associated with a component follows the [component scope](scope) rules. A view partial used inside a component will inherit the scope of the scope of the component.

### within

There are times when you may want your partial to use the scope where it is used rather than where it is called. This is generally useful for meta-programming where a component author wants to allow the component user to define a custom representation. The `within` keyword lets you control this behavior.

```derby
<!-- usage -->
<dropdown list="{{users}}">
  <item within>
    <!-- accessing #item which is only defined inside the dropdown component -->
    <icon user-id="{{#item.id}}"> {{#item.name}}
  </item>
</dropdown>

<index: attributes="item">
  {{each @list as #item}}
    {{@item}}
  {{/each}}
```

### inherit
There are some cases where you would like to instanciate a component and pass along the attributes of the current controller. The inherit keyword will allow you to do this.

```derby
<index:>
  {{@foo}}
  <modal inherit></modal>

<modal:>
  {{@foo}}
```

### extend
When writing a component that has very similar logic to another component you may want to wholesale include the other component's template. You can do this with the `extend` keyword

```derby
<index:>
  <modal extend></modal>
  more {{custom}} stuff
```

### import
If you just want to reuse a view partial the `import` keyword is probably more appropriate. See the [namespaces and files](../views/namespaces-and-files#structuring-views-in-multiple-files) documentation for more details.


## Programatic view management

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

A relatively quick way to inspect a component for debugging is to find it's comment in the browser's DOM inspector. 
In modern browsers clicking on the comment allows you to reference it in the console with `$0`. 
Once you have a reference to the comment tag you can access it's controller with `$0.$component` and it's model data with `$0.$component.model.get()`

<img src="/images/docs/charts-debug.png">

### derby-debug
There is a plugin which makes accessing your components from the console even more accessible that is recommended for development.
Read more about [derby-debug](https://github.com/derbyjs/derby-debug).
