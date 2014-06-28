# Apps and static pages

Derby projects support one or more single-page apps as well as static pages.
Apps have a full MVC structure, including a model provided by
[Racer](http://racerjs.com/), a template and styles based view, and controller
code with application logic and routes (which map URLs to actions). Static
pages consist of only templates and styles.

On the server, apps provide a router middleware for Express. One or more app
routers as well as server only routes can be included in the same Express
server.

Derby packages up all of an app's templates, routes, and application code when
rendering. Regardless of which app URL the browser requests initially, the app
is able to render any other state within the same application client-side. If
the app cannot handle a URL, it will fall through and request from the server.
Errors thrown during route handling also cause requests to fall through to the
server.

Derby works great with only a single app, though developers may wish to create
separate apps if only certain sets of pages are likely to be used together. For
example, a project might have a separate desktop web app and mobile web app. Or
a project might have an internal administration panel app and a public content
app.

## Creating apps

Apps are created in the file that defines the app's controller code. They are
then associated with a server by requiring the app within the server file.

> ### `app = `derby.createApp` ( module )`
>
> **module:** Derby uses the module object to create an app. The app's name is
> taken from its filename, and Derby exports a number of methods on the app.
>
> **app:** Returns an app object, which is equivalent to `module.exports`.

The app's filename is used to determine the name of the app. App names are used
to automatically associate an app with template and styles files of the same
name.

The app name is also used as the name of the global variable that the
application exposes in the browser. Therefore, app names should be valid
JavaScript variable names, starting with a letter and containing only
alphanumeric characters and underscores.

The `createApp` method adds a number of methods to the app. On both the client
and the server, these are `use`, `view`, `fn`, `get`, `post`, `put`, `del`,
`enter`, `exit`, and `ready`. On the server only, Derby also adds `router`,
`render`, and `scripts`, for use with Express.

## Connecting servers to apps

The Derby project generator outputs an Express server for a typical setup.
Because Derby shares most code between server and client, Derby server files
can be very minimal.

The server includes an app with a standard Node.js require statement. It can
then use the `app.router()` method to create a router middleware for Express
that handles all of the app's routes.

The server also needs to create a `store` object, which is what creates models,
coordinates data syncing, and interfaces with databases. Stores are created via
the `derby.createStore()` method. See [Creating stores](#creating_stores).

## Static pages

Derby can also render static pages from templates and styles not associated
with an app. This is useful for error pages and other pages that don't need
dynamic content.

> ### `staticPages = `derby.createStatic` ( root )`
>
> **root:** The root path that contains the "views" and "styles" directories.
>
> **staticPages:** Returns a staticPages object, which has a render method.
> (While unused, static is a [reserved JavaScript
> keyword](https://developer.mozilla.org/en/JavaScript/Reference/Reserved_Words),
> and it cannot be a variable name.)

The staticPages object keeps a reference to the directory root and provides a
`staticPages.render()` method. It is intended for use in server-only Express
routes. See [Rendering](#rendering).