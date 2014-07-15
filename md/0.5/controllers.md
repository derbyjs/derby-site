## Controllers

Derby controllers are defined in the script file that invokes `derby.createApp()`. Typically, controllers are located at `lib\app_name\index.js` or `src\app_name\index.coffee`. See [Creating apps](#creating_apps).

Controllers include routes, user event handlers, and application logic. Because Derby provides model-view bindings and syncs models automatically, directly manipulating the DOM and manually sending messages to the server should rarely be necessary.

## Routes

Routes map URL patterns to actions. Derby routes are powered by [Express](http://expressjs.com/), which is similar to [Sinatra](http://www.sinatrarb.com/). Within apps, routes are defined via the `get`, `post`, `put`, and `del` methods of the app created by `derby.createApp()`.

> ### app.get` ( routePattern, callback(page, model, params, next) )`
> ### app.post` ( routePattern, callback(page, model, params, next) )`
> ### app.put` ( routePattern, callback(page, model, params, next) )`
> ### app.del` ( routePattern, callback(page, model, params, next) )`
>
> **pattern:** A string containing a literal URL, an Express route pattern, or a regular expression. See [Express's routing documentation](http://expressjs.com/guide.html#routing) for more info.
>
> **callback:** Function invoked when a request for a URL matching the appropriate HTTP method and pattern is received. Note that this function is called both on the server and the client.
>
> **page:** Object with the methods [`page.render()`](#pagerender)  and `page.redirect()`. All app routes should call one of these two methods or pass control by calling `next()`.
>
> **model:** Derby model object
>
> **params:** An object containing the matching URL parameters. The `url`, `query`, and `body` properties typically available on `req` are also added to this object.
>
> **next:** A function that can be called to pass control to the next matching route. If this is called on the client, control will be passed to the next route defined in the app. If no other routes in the same app match, it will fall through to a server request.

> ### page.redirect` ( url, [status] )`
>
> **url:** Destination of redirect. [Like Express][expressRedirect], may also be the string 'home' (which redirects to '/') or 'back' (which goes back to the previous URL).
>
> **status:** *(optional)* Number specifying HTTP status code. Defaults to 302 on the server. Has no effect on the client.

[expressRedirect]: http://expressjs.com/guide.html#res.redirect()

Unlike Express, which provides direct access to the `req` and `res` objects created by Node HTTP servers, Derby returns `page`, `model`, and `params` objects. These provide the same interface on the client and the server, so that route handlers may be executed in both environments.

Express is used directly on the server. On the client, Derby includes Express's route matching module. When a link is clicked or a form is submitted, Derby first tries to render the new URL on the client.

Derby can also capture form submissions client-side. It provides support for `post`, `put`, and `del` HTTP methods using the same hidden form field [override approach](http://expressjs.com/guide.html#http-methods) as Express.

### Transitional routes

In the client, there are a number of situations where it makes sense to update the URL but only part of the UI needs to update. For example, one might want to show a lightbox on top of a given page or update only the content area of a page and not the surrounding chrome.

In these cases, transitional routes provide a more efficient and flexible solution to updating the page. On the server or from a different page, calling a transitional route renders the entire page like a normal route. However, when coming from the same page in the client, a transitional route only runs code to update the model and the appropriate view bindings.

Transitional routes make it possible to use CSS animations, since only the relevant elements are updated. If the full page were re-rendered, the current HTML elements would be replaced with new ones. Then, the CSS animation would not be able to figure out how a given element's styles had changed.

Transitional routes use the same `get`, `post`, `put`, and `del` methods, but they take both a from and to pattern as well as a forward and back callback. Since transitional routes cannot render the entire page but only update data in the model, their callbacks do not have a `page` argument.

```javascript
get('/photo/:id', function (page, model, params, next) {
  // Normal page rendering code goes here
  ...

  // The transitional route callback will execute right before
  // the render method is called
  page.render();
})

get({from: '/photo/:id', to: '/photo/:id/lightbox'}, {
  forward: function (model, params, next) {
    model.set('_page.showLightbox', true);
  }
, back: function (model, params, next) {
    model.del('_page.showLightbox');
  }
});
```
```coffeescript
get '/photo/:id', (page, model, params, next) ->
  # Normal page rendering code goes here
  ...

  # The transitional route callback will execute right before
  # the render method is called
  page.render()

get from: '/photo/:id', to: '/photo/:id/lightbox',
  forward: (model, params, next) ->
    model.set '_page.showLightbox', true
  back: (model, params, next) ->
    model.del '_page.showLightbox'
```

Transitional routes support literal string routes and patterned routes with named parameters like `:id` and wildcard captures like `*`. However, they do not support arbitrary regular expressions.

When a `to` route is requested on the server or from a different page, the router first pretends like the `from` route was called. It replaces any named parameters and wildcards based on their equivalents in the from route, and then does a lookup for the from route.

After that, the original route is executed up to the `page.render()` call. Next, the `forward` callback of the transitional route is called. This simulates first navigating to the original route and then transitioning to the new route. Finally, `page.render()` is executed.

In the above example, the possible transitions would be:

<table>
  <tr>
    <th>Starting from</th>
    <th>Going to</th>
    <th>Effect</th>
  </tr>
  <tr>
    <td>From server or another page</td>
    <td>/photo/42</td>
    <td>Run the original route normally</td>
  </tr>
  <tr>
    <td>/photo/42</td>
    <td>/photo/42/lightbox</td>
    <td>Run the `forward` callback only</td>
  </tr>
  <tr>
    <td>/photo/42/lightbox</td>
    <td>/photo/42</td>
    <td>Run the `back` callback only</td>
  </tr>
  <tr>
    <td>From server or another page</td>
    <td>/photo/42/lightbox</td>
    <td>Run the original route for `/photo/42` up to `page.render()`, then the `forward` callback, then render</td>
  </tr>
</table>

### History

For the most part, updating the URL client-side should be done with normal HTML links. The default action of requesting a new page from the server is canceled automatically if the app has a route that matches the new URL.

To update the URL after an action other than clicking a link, scripts can call methods on `view.history`. For example, an app might update the URL as the user scrolls and the page loads more content from a paginated list.

> ### view.history.push` ( url, [render], [state], [e] )`
> ### view.history.replace` ( url, [render], [state], [e] )`
>
> **url:** New URL to set for the current window
>
> **render:** *(optional)* Re-render the page after updating the URL if true. Defaults to true
>
> **state:** *(optional)* A state object to pass to the `window.history.pushState` or `window.history.replaceState` method. `$render` and `$method` properties are added to this object for internal use when handling `popstate` events
>
> **e:** *(optional)* An event object whose `stopPropogation` method will be called if the URL can be rendered client-side

Derby's `history.push` and `history.replace` methods will update the URL via `window.history.pushState` or `window.history.replaceState`, respectively. They will fall back to setting `window.location` and server-rendering the new URL if a browser does not support these methods. The `push` method is used to update the URL and create a new entry in the browser's back/forward history. The `replace` method is used to only update the URL without creating an entry in the back/forward history.

> ### view.history.refresh` ( )`
>
> Re-render the current URL client-side

For convenience, the navigational methods of [`window.history`](https://developer.mozilla.org/en/DOM/window.history) can also be called on `view.history`.

> ### view.history.back` ( )`
>
> Call `window.history.back()`, which is equivalent to clicking the browser's back button

> ### view.history.forward` ( )`
>
> Call `window.history.forward()`, which is equivalent to clicking the browser's forward button

> ### view.history.go` ( i )`
>
> Call `window.history.go()`
>
> **i:** An integer specifying the number of times to go back or forward. Navigates back if negative or forward if positive

## User events

Derby automates a great deal of user event handling via [model-view binding](#bindings). This should be used for any data that is tied directly to an element's attribute or HTML content. For example, as users interact with an `<input>`, value and checked properties will be updated. In addition, the `selected` attribute of `<option>` elements and edits to the innerHTML of `contenteditable` elements will update bound model objects.

For other types of user events, such as `click` or `dragover`, Derby's [`x-bind`](#dom_event_binding) attribute can be used to tie DOM events on a specific element to a callback function in the controller. Such functions must be exported on the app module.

Even if controller code is responding to a DOM event, it should typically only update the view indirectly by manipulating data in the model. Since views are bound to model data, the view will update automatically when the correct data is set. While this way of writing client code may take some getting used to, it is ultimately much simpler and less error-prone.

## Model events

[Model events](#model_events) are emitted in response to changes in the model. These may be used directly to update other model items and the resulting views, such as updating a count of the items in a list every time it is modified.

## Application logic

Application logic executes in response to routes, user events, and model events. Code that responds to user events and model events should be placed within an `app.enter()` callback. This provides the model object for the client and makes sure that the code is only executed on the client.

> ### app.enter` ( routePattern, callback(model) )`
> ### app.exit` ( routePattern, callback(model) )`
>
> **routePattern:** A string containing a literal URL, an Express route pattern, or a regular expression. See [Express's routing documentation](http://expressjs.com/guide.html#routing) for more info.
>
> **callback:** Function called as soon as the Derby app is loaded on the client. Note that any code within this callback is only executed on the client and not on the server.
>
> **model:** The Derby model object for the given client

There is also an `app.ready()` method, which is only called on the very first page load and not after any client-side rendered page transitions.

> ### app.ready` ( callback(model) )`
>
> **callback:** Function called as soon as the Derby app is loaded on the client. Note that any code within this callback is only executed on the client and not on the server.
>
> **model:** The Derby model object for the given client

Application logic should be written to share as much code between servers and clients as possible. For security reasons or for direct access to backend services, it may be necessary to only perform certain functions on servers. However, placing as much code as possible in a shared location allows Derby apps to be extremely responsive and work offline by default.

## Access control

A basic acccess control mechanism is implemented, but it isn't documented quite yet. An example is coming soon.