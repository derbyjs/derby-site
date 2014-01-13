# History

## Usage

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