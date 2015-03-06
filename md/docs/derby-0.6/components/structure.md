# Structure

The controller defines the behavior of the component. A component's controller can 

> `Controller = function() {}`
> * `Controller` The prototypical function for defining a component's behavior

> `Controller.prototype.init = function(ChildModel) {}`
> * `init` The function called upon a component's instanciation. Data can be initialized on the component's scoped model. Note that the DOM is generally not available when init is called.

> `Controller.prototype.create = function(ChildModel, Dom) {}`
> * `create` *(optional)* The function called on the client when a component is loaded and ready in the DOM. 

> `Controller.prototype.name = 'name'`
> * `name`  The name will associate the component with a view.
> `Controller.prototype.view = 'path/to/view`

> `Controller.prototype.view = 'view'`
> * `view` *(optional)* The relative path to a template file to load. If the view file is named *index.html* and in the same directory as the controller, the directory *__dirname* can be specified

> `Controller.prototype.style = 'path/to/style'`
> * `style` *(optional)* The relative path to a style file to load. If the view file is named *index.css* and in the same directory as the controller, the directory *__dirname* can be specified

### View functions
Functions defined on the component's prototype will be available in the scope of the component's view, as demonstrated by the `select` function in the below example. See the [controller property lookup](views/template-syntax/functions-and-events#controller-property-lookup) documentation.


## View definition
A component's view is typically defined in it's own file as such:
```derby
<index:>
  <p> arbitrary html content </p>
  <div>
    {{@content}}
  </div>
  <div as="chart">
    <span class="bars" on-click="select($event)">
      {{foo}}
    </span>
  </div>
```
It is possible to associate a controller with any view as long as you follow the [namespace](views/namespaces-and-files) rules.

## Controller definition
```js
MyComponent = function() {}

MyComponent.prototype.name = 'mySweetComponent';
MyComponent.prototype.view = __dirname;
MyComponent.prototype.style = __dirname;

MyComponent.prototype.init = function(model) {
  // data initialization
  model.setNull('foo', 'bar');
}
MyComponent.prototype.create = function(model) {
  // DOM related initialization
  var bars = this.chart.querySelectorAll('.bars')
  ...
}
MyComponent.prototype.select = function(evt) {
  // view function
}
```


## Component usage

```js
app.use(MyComponent);
// or if you haven't defined the name in the prototype
// you can associate the controller with an arbitrary view
app.use('namespace:name', MyComponent);
```

```derby
<view is="mySweetComponent" foo="{{_page.bar}}"></view>
```
