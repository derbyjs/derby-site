# Views

When writing an app or new feature in Derby, you should typically start by writing its view. Derby templates can be written in HTML or Jade with [derby-jade](https://github.com/derbyparty/derby-jade). Templates define HTML/DOM output, data bindings, event listeners, and component parameters.

## Creating views

Views are written in HTML files. These files are parsed and added to a Derby app with the `app.loadViews()` method. This method synchronously reads template files, traverses their includes, and calls `app.views.register()` for each view.

> `app.loadViews(filename)`
> * `filename` File path to root template file at which to start loading views

> `app.views.register(name, source, options)`
> * `name` View name to add
> * `source` Derby HTML source
> * `options:`
>   * `tag` Name of an HTML tag that will render this view
>   * `attributes` Space separated list of HTML tags interpreted as an attribute when directly within the view instance
>   * `arrays` Space separated list of HTML tags interpreted as an array of objects attribute when directly within the view instance
>   * `unminified` Whitespace is removed from templates by default. Set true to disable
>   * `string` True if the template should be interpreted as a string instead of HTML

> `view = app.views.find(name, [namespace])`
> * `name` View name to find
> * `namespace` *(optional)* Namespace from which to start the name lookup
> * `view` Returns the view template object

Each view is wrapped in a tag that names it. This name must end in a colon to differentiate it from a normal HTML tag. These tags can't be nested, and they need not be closed.

```derby
<serious-title:>
  <h1>Hello, sir.</h1>

<friendly-title:>
  <h1>Howdy!</h1>
```

is equivalent to:

```js
app.views.register('serious-title', '<h1>Hello, sir.</h1>');
app.views.register('friendly-title', '<h1>Howdy!</h1>');
```

## Using views

You can instantiate a view in a template with the `<view>` tag, `{{view}}` expression, or by giving the view a tag name. Typically, you should use the `<view>` tag in HTML templates. The `{{view}}` expression is useful when writing string templates or wish to include a view in an HTML attribute, script tag, or style tag. Custom tag names are global to an application. They are recommended for general purpose components, like `<tabs>` or `<dropdown>`, but not for ordinary views.

```derby
<serious-title: tag="seriousness">
  <h1>Hello, sir.</h1>

<Body:>
  <!-- Recommended form -->
  <view is="serious-title"></view>
  <!-- Self-closing tag syntax is also supported -->
  <view is="serious-title" />
  <!-- Expression form is used for non-HTML templates -->
  {{view 'serious-title'}}
  <!-- Custom tags may be defined for views -->
  <seriousness></seriousness>
  <seriousness />
```

Views may be looked up dynamically with an expression. If the name of a view isn't found, an error will be thrown unless the `optional` attribute is specified.

```derby
<Body:>
  <!-- Dynamic view lookup based on an expression -->
  <view is="{{type}}-title"></view>
  {{view type + '-title'}}
  <!-- Specify `optional` to not throw if view isn't found -->
  <view is="{{type}}-title" optional></view>
  {{view type + '-title', {optional: true}}}
```

## View namespaces

View names have colon (`:`) separated namespaces. Lookups of views are relative to the namespace in which they are used. Thus, sub-views within components or different sections of large applications are well encapsulated and won't run into naming conflicts.

```derby
<home:stuff:>
  ...

<about:stuff:>
  ...

<about:Body:>
  <!-- Outputs stuff for the about page -->
  <view is="stuff"></view>
```

In addition, similar to the way that CSS allows overriding of styles by using a more specific selector, you can define views at a more general namespace and then redefine them at a more specific namespace.

```derby
<Title:>
  App

<about:Title:>
  About - App

<about:mission:Title:>
  Mission statement - App
```

## Breaking views into multiple files

