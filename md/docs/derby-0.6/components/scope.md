# Scope

A component's model is always a decendent of the root model. 

## Child Model
All paths in a components model are scoped to it's local context. There are no collections on child models so the rules of the root model don't apply around private paths. For example `model.set("foo", "bar") is completely valid inside a component.


## Attributes
The most direct way to get data into a component is to pass in a reference or a literal as an attribute.


```derby
<view is="user-list" data="{{users}}" foo="{{true}}" ></view>
```

### scopped paths
can referrence data passed in
```derby
<index:>
  {{each users as #user}}
    {{#user}}
  {{/each}}
```


### literals
all attributes set to strings will be treated as strings. this means if you want to pass a number or boolean literal to a component you must use bindings.

```derby
<view is="thing" foo="{{true}}" numba="{{7}}"></view>
<index:>
  {{if foo}}
    bar!
  {{/if}}
```

### templates
complex expressions that involve multiple bindings or view functions will be passed in as a template.
```derby
<view is="great" foo="{{ {x: _page.width, y: _page.height} }}" bar="{{format(_page.bar)}}"></view>
```


getAttribute

setAttribute


## With


## Root
There are times when accessing data in the root model is desirable from within the comp