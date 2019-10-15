# Files

Derby supports a variety of file structure patterns. You may define an application and components all in a single file, but typically it is best to have one folder per component. For example, you might have a shared component for a search box:

```
/search-box
  index.html
  index.js
```

# View

Derby views are written in HTML templates. For our search box component, we might have the template:

```derby
<index:>
  <input class="search-box" value="{{value}}">
```

# Controller

Component controllers are written as a class that extends Derby's `Component` base class.

```js
const Component = require('derby').Component;
```

## User-defined prototype properties and methods

Components may define the following:

> `MyComponent.prototype.init = function(ChildModel)` If defined, called immediately after the component object is constructed, but before the view is rendered. Data and reactive functions can be initialized on the component's scoped model. This method is invovked both on the server and on the client, so the DOM and browser-only methods may not be used within init().

> `MyComponent.prototype.create = function(ChildModel, Dom)` If defined, called in the browser when a component is loaded and inserted into the DOM. This method is never called on the server. DOM-related code and model event listeners should be placed in create().

> `MyComponent.view = 'path/to/view'` The relative file path to a template file to load. If the view file is named *index.html* and in the same directory as the controller, *\__dirname* can be specified

> `MyComponent.is = 'my-component'` The name of the component in the view. Corresponds to


```js
// Babel and upcoming JavaScript

class SearchBox extends Component {
  static is = 'search-box';
  static view = __dirname;
  init() {
    ...
  }
}
module.exports = SearchBox;


// Typescript

export = SearchBox;
class SearchBox extends Component {
  static is = 'search-box';
  static view = __dirname;
  init() {
    ...
  }
}


// CoffeeScript

module.exports = class SearchBox extends Component
  @is: 'search-box'
  @view: __dirname
  init: ->
    ...


// JavaScript (ES6+)

class SearchBox extends Component {
  init() {
    ...
  }
}
module.exports = SearchBox;
SearchBox.is = 'search-box';
SearchBox.view = __dirname;


// JavaScript (ES5)

module.exports = SearchBox;
SearchBox.is = 'search-box';
SearchBox.view = __dirname;

function SearchBox() {}
SearchBox.prototype = Object.create(Component.prototype);
SearchBox.prototype.constructor = SearchBox;

SearchBox.prototype.init = function() {
  ...
};
```


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

```derby
<tabs: arrays="pane" tag="tabs">
  <ul class="tabs-nav">
    {{each @pane as #pane, #i}}
      <li class="{{if selectedIndex === #i}}active{{/if}}">
        <a on-click="select(#i)">{{#pane.title}}</a>
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
```styl
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
```js
module.exports = Tabs;

function Tabs() {}
Tabs.view = __dirname + '/tabs.html';

Tabs.DataConstructor = function() {
  this.selectedIndex = 0;
};

Tabs.prototype.select = function(index) {
  this.model.set('selectedIndex', index);
};
```

### tabs.ts
```js
export = Tabs;
class TabsData {
  selectedIndex: number = 0;
}
class Tabs extends Component<TabsData> {
  static view = __dirname;
  static DataConstructor = TabsData;
  selectedIndex = this.model.at('selectedIndex');

  select(index: number): void {
    this.selectedIndex.set(index);
  }
}
```

### tabs.coffee
```coffee
module.exports = class Tabs
  @view: __dirname + '/tabs.html'

  @DataConstructor: class
    constructor: ->
      @selectedIndex = 0

  select: (index) ->
    @model.set 'selectedIndex', index
```

