# Router

Client app Router

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

## Transitional routes

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