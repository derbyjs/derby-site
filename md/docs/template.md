# Template

## Creating templates

Derby compiles a collection of HTML-based templates into a page based on a
number of pre-defined names. Pages usually define at least a `Title` and `Body`
template. Templates may be created programmatically via the `view.make()`
method:

```javascript
var view = require('derby').createApp(module).view;

view.make('Body', '<h1>Howdy!</h1>');
```

```coffeescript
{view} = require('derby').createApp module

view.make 'Body', '<h1>Howdy!</h1>'
```

However, they are generally placed in template files within the `views`
directory. Each app automatically looks for a template file that shares the
same name and calls view.make for each template. Templates placed in a template
file are also automatically bundled with the application scripts so that they
can be rendered on the client.

Template files are also HTML, but each template is wrapped in a tag that names
the template. This name must end in a colon to differentiate it from a normal
HTML tag. These tags need not be closed. For example:

```html
<Title:>
  Silly example

<Body:>
  <h1>Howdy!</h1>
```

## Pre-defined templates

By default, Derby includes templates with the names `Doctype`, `Root`,
`Charset`, `Title`, `Head`, `Header`, `Body`, `Footer`, `Scripts`, and `Tail`
when it renders a page on the server.

In the browser, only the `Root`, `Title`, `Header`, `Body`, and `Footer`
templates are re-rendered. Thus, model-view bindings may only be defined within
these templates.

Some of pre-defined templates have names that also are the names of HTML tags,
but only `Title` wraps the template inside of a `<title>` tag. Derby does *not*
include any non-required HTML elements, such as `<html>`, `<head>`, and
`<body>` by default.

By convention, Pre-defined template names are capitalized to indicate that the
page renderer will include them automatically. However, since HTML tags are
case-insensitive, Derby template names are also case insensitive. Thus, `Body`,
`BODY`, and `body` all represent the same template.

Note that template files don't contain boilerplate HTML, such as doctype
definitions, stylesheets, and script includes. By default, Derby includes these
items in an order optimized for fast load times. Also to optimize load time, it
sends pages a number of chunks:

### First chunk

1. **`Doctype:`** Standard HTML5 doctype---`<!DOCTYPE html>`---unless overridden
2. **`Root:`** Optional location for an `<html>` element if desired. This template should not include any other elements
3. **`Charset:`** `<meta charset=utf-8>` unless overridden
4. **`Title:`** The text content of the page's `<title>` element
5. **`Head:`** Optional location for meta tags, scripts that must be placed in the HTML `<head>`, and manually included stylesheets
6. CSS is compiled and inserted after the Head template automatically
7. **`Header:`** Optional location for a page header that will be sent with the initial response chunk. Note that this is actually part of the HTML `<body>`, but it should render correctly by itself. It is separated out so that it can be displayed to the user before the rest of the page if the remainder of the page takes a while to download. Typically this includes fixed content, such as a logo and a top navigation bar

### Second chunk

8. **`Body:`** The page's main content
9. **`Footer:`** Optional location for content to include after the body. Used for copyright notices, footer links, and other content repeated at the bottom of multiple pages

### Third chunk

10. Inline scripts can be added via the `view.inline()` method. Scripts are typically included this way if they are needed to properly render the page, such as resizing an element based on the window size
11. **`Scripts:`** Optional location for external scripts loaded before the client scripts. Note that this template is just a location within the page, and it is not wrapped in a script tag
12. Client scripts are automatically included via an asynchronously loaded external script
13. JSON bundle of the model data, event bindings, and other data resulting
from rendering the page. This bundle initializes the application once the
external client script loads.
14. **`Tail:`** Optional location for additional scripts to be included at the very end of the page

<style>
ol{counter-reset: item}
ol>li{display: block}
ol>li:before{content: counter(item) ". "; counter-increment: item}
#second_chunk+ol{counter-reset: item 7}
#third_chunk+ol{counter-reset: item 9}
</style>

## Importing templates

Each view template file **must** be explicitly imported, starting from the
main index.html file for an app.

File paths are expressed relatively, similar to how Node.js modules are loaded.
Like in Node.js modules, either `pageName.html` or `pageName/index.html` can be
imported as `pageName`.

```html
<!-- all templates from "./home.html" with the namespace "home" -->
<import: src="home">

<!-- all templates from "./home.html" into the current namespace -->
<import: src="home" ns="">

<!-- one or more specific templates with the namespace "home" -->
<import: src="home" template="message alert">

<!-- one template as a different name in the current namespace -->
<import: src="home" template="message" as="myMessage">
```

Templates defined in a parent namespace are inherited unless they are
overridden by a template with the same name in the child namespace. Thus, it
often makes sense to place common page elements in a main file that imports a
number of other files and override the part of the page that is different.

Template components are referenced relative to their current namespace.
Namespaces are separated by colons, and a namespace can be passed to the
`page.render()` method to render a specific page or application state.

Note that passing a namespace to `page.render()` **does not** cause a template
file to be loaded by filename. All of the app's templates are loaded at once, so
that they can be packaged up to render any page in the browser. It happens to be
that a namespace usually has the same name as the file, because the `<import:>`
tag uses the filename as the default namespace. However, every file must be
explicitly imported, starting at the app's main index.html file.

### shared.html
```html
<profile:>
  <div class="profile">
    ...
  </div>
```

### home.html
```html
<import: src="shared">

<Body:>
  Welcome to the home page
  <!-- include component from an imported namespace -->
  <app:shared:profile>
```

### index.html
```html
<import: src="home">
<import: src="contact">
<import: src="about">

<Body:>
  Default page content

<Footer:>
  <p><small>&copy; {{year}}</small></p>
```

### Context
```javascript
page.render('home', {
  year: 2012
});
```
```coffeescript
page.render 'home',
  year: 2012
```

See [Components](#components) for more info on defining template components.

## Template syntax

Derby's template syntax is largely based on
[Handlebars](http://handlebarsjs.com/), a popular semantic templating
language similar to [Mustache](http://mustache.github.com/mustache.5.html).

If you use Sublime Text 2 or TextMate, you can use [our fork of the HTML5
bundle](https://github.com/codeparty/html5.tmbundle) to get proper
syntax highlighting of Derby templates. You might want to also try our [Clean
color theme](https://github.com/codeparty/clean-textmate), which
highlights each type of template tag appropriately.

A simple Handlebars template:

```html
    Hello {{name}}
    You have just won ${{value}}!
    {{#if inCalifornia}}
        Well, ${{taxedValue}}, after taxes.
    {{/if}}
```

Given the following data context:

```javascript
    {
        name: "Chris",
        value: 10000,
        taxedValue: 10000 - (10000 * 0.4),
        inCalifornia: true
    }
```

Will produce the following:

```html
    Hello Chris
    You have just won $10000!
    Well, $6000.0, after taxes.
```

Semantic templates better enforce separation of logic from presentation by
restricting the ability to embed logic within views. Instead of conditional
statements and loops, there is a small set of template tags. During rendering,
data are passed to the template, and template tags are replaced with the
appropriate values. This data is often referred to as the "context."

With Handlebars, application code generates a context object before rendering
the view. It then passes that object along with the template at render time.
Derby templates can be used this way as well. However, in addition to looking
for objects in a context object, Derby assumes that the model is part of the
context. Even better, Derby is able to automatically establish live bindings
between the view and objects in the model. Derby slightly extends the
Handlebars syntax in order to support these features.

The other major difference between Handlebars and Derby templates is that Derby
templates must be valid HTML first. Handlebars is language agnostic---it can be
used to compile anything from HTML to source code to a document. However, Derby
templates are first parsed as HTML so that the parser can understand how to
bind data to the surrounding DOM objects. Template tags are only allowed within
elements or text, within attribute values, and surrounding elements.

### Invalid template tag placements
```html
<!-- INVALID: Within element names -->
<{{tagName}}>Bad boy!</{{tagName}}>

<!-- INVALID: Within attribute names -->
<b {{attrName}}="confused" {{booleanAttr}}>Bad boy!</b>

<!-- INVALID: Splitting an html tag -->
<b{{#if maybe}}>Bad boy!</b{{/}}>

<!-- INVALID: Splitting an element -->
{{#if maybe}}<b>{{/}}Bad boy!</b>
```

### Valid placements
```html
<!-- Within an element -->
Let's go <b>{{activity}}</b>!

<!-- Within text -->
<b>Let's go {{activity}}!</b>

<!-- Within attribute values -->
<b style="color:{{displayColor}}">Let's go running!</b>

<!-- Surrounding one or more elements and text -->
{{#if maybe}}<b>Let's go dancing!</b>{{/}}
```

## Whitespace and HTML conformance

Before parsing, all HTML comments, leading and trailing whitespace, and new
lines are removed from templates. This reduces page size, and it keeps template
code more readable when spaces are not desired between inline elements. If you
do want whitespace at the beginning or end or a line, add the non-standard `&sp;`
character entity, which will simply be replaced with a space.

The contents of `<script>` and `<style>` tags are passed through literally,
except for whitespace removal. This whitespace removal can be disabled within
an element by adding an `x-no-minify` attribute.

```html
<script type="application/x-yaml" x-no-minify>
  firstName: Sam
  lastName : Reed
</script>
```

Derby's HTML parser should be able to parse any valid HTML, including elements
that don't require closing tags and unquoted attributes. However, it is
recommended that you **always include closing tags** for elements like `<p>`
and `<li>` that might not require a closing tag. The rules around how tags are
automatically closed are complex, and there are certain cases where template
sections may be included within an unexpected element.

HTML attribute values only need to be quoted if they are the empty string or if
they contain a space, equals sign, or greater than sign. Since Derby templates
are parsed as HTML first, any of these characters within a template tag require
an attribute to be escaped. Using **quotes around all attribute values** is
recommended.

Because it understands the HTML context, Derby's HTML escaping is more
minimal than that of many templating libraries. You may be surprised to see
unescaped `>` and `&` characters. These only need to be escaped in certain
contexts, and Derby only escapes them when needed. If you are skeptical, an
[HTML5 validator](http://html5.validator.nu/) will detect most escaping bugs.

Throughout these docs, the output of templates is shown indented and on
multiple lines for the sake of readability. However, Derby's renderer would not
output any indentation or line breaks. In addition, output attribute values are
quoted, but Derby only includes quotes around attribute values if they are
needed.