# View

Typically, writing Derby apps begins with HTML templates. These templates definethe rendered HTML as well as model-view bindings.

## Rendering

Views are rendered in response to [routes](#routes). Most routes should be defined inside of an app so that they can be handled both on the client and the server. Views can also be rendered in response to server only routes.

In each render method, `namespace`, `model`, `context`, and `status` arguments may be in any order or omitted.

> ### page.render` ( [namespace], [context], [status] )`
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Object specifying additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default. Has no effect when rendering on the client.

App routes supply a page object, which provides a consistent interface for rendering an entire page on both server and client. On the server, the page is rendered by calling Node.js response object methods like `res.write`. On the client, Derby renders the page locally. It then replaces the `document.title` and `document.body.innerHTML`, and updates the URL with `history.pushState`.

The page's render function implicitly renders in the context of the app's model. An additional context object may be supplied for items that are only needed at render time.

> ### app.render` ( res, model, [namespace], [context], [status] )`
>
> **res:** Response object passed to the Express routing callback
>
> **model:** A Derby model object used for rendering. The contents of the model will be serialized and initialized into the same state in the browser once the page loads.
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default.

Apps may also be rendered within server only Express routes. In this case, it is necessary to provide the renderer with a response object and model. When using the store.modelMiddleware, the model for a request is retrieved from `req.getModel()`. Otherwise, models can be made directly from the store via the `store.createModel()` method.

> ### staticPages.render` ( name, res, [model], [namespace], [context], [status] )`
>
> **name:** Name of the view and style files to render
>
> **res:** Response object passed to the Express routing callback
>
> **model:** *(optional)* A Derby model object. A model object may be used for rendering, but it will not be serialized and included with a static page. Static pages don't have an associated app, and they don't include scripts by default.
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default.

For creating error pages and other static pages, Derby provides a `staticPages` object that renders a template and script file specified by name. Typically, this is used without a model object, but it is possible to supply a model object that is used for rendering only. See [Static pages](#static_pages).

## app.view

Derby adds an `app.view` object for creating and rendering views.

> ### view.make` ( name, template )`
>
> **name:** Name of the template
>
> **template:** A string containing the Derby template. Note that this should be only the content of the template, and it should not have a template name element, such as `<Body:>` at the start.

Apps should typically place all templates in a template file in the `views` folder instead of calling `view.make()` directly. However, templates may be added to an app this way as well.

Note that calling `view.make()` only renders the template; it does not include the template in the external script file separately. Thus, it must be called again on the client when the app loads.

> ### view.inline` ( fn )`
>
> **fn:** Function to be inlined in the page and called immediately when the page loads.

This method is intended solely for server use and has no effect when called in the browser.

Scripts should be included inline in the page if needed to properly render the page. For example, a script might adjust the layout based on the window size, or it might autofocus a sign in box in browsers that don't support the HTML5 autofocus attribute.

Usually, it is preferable to place such scripts in a separate file called `inline.js` in the same directory as the app. This file will be automatically inlined when the app is created. Calling `view.inline()` directly does the same thing, but it is redundant to send the script inline and also include it in the app's external script file.