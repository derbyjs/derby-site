# Structure

A component is defined by it's controller class.


> `Controller = function() {}`
> * `Controller` The prototypical function for defining a component's behavior

> `Controller.prototype.init = function(ChildModel) {}`
> * `init` The function called upon a component's instanciation. Data can be initialized on the component's scoped model. Note that the DOM is generally not available when init is called.

> `Controller.prototype.create = function(ChildModel, Dom) {}`
> * `create` The function called on the client when a component is loaded and ready in the DOM. 

> `Controller.prototype.name = 'name'`
> * `name`  The name will associate the component with a view.
> `Controller.prototype.view = 'path/to/view`

> `Controller.prototype.view = 'view'`
> * `view` *(optional)* The relative path to a template file to load. If the view file is named *index.html* and in the same directory as the controller, the directory *__dirname* can be specified

> `Controller.prototype.style = 'path/to/style'`
> * `style` *(optional)* The relative path to a style file to load. If the view file is named *index.html* and in the same directory as the controller, the directory *__dirname* can be specified



```derby
<index:>
  <view is="thing"></view>
  <div as="chart">
    <span class="bars">
      {{foo}}
    </span>
  </div>
```

```js
app.use('name', MyComponent);
//or
app.use(MyComponent);

MyComponent = function() {}

MyComponent.name: 'name';
MyComponent.view: __dirname;
MyComponent.style: __dirname;

MyComponent.prototype.init = function(model) {
  model.setNull('foo', 'bar')
}
MyComponent.prototype.create = function(model) {
  var bars = this.chart.querySelectorAll('.bars')
  ...
}
```