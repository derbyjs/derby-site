# Controllers

Derby controllers are defined in the script file that invokes `derby.createApp()`. Typically, controllers are located at `lib\app_name\index.js` or `src\app_name\index.coffee`. See [Creating apps](#creating_apps).

Controllers include routes, user event handlers, and application logic. Because Derby provides model-view bindings and syncs models automatically, directly manipulating the DOM and manually sending messages to the server should rarely be necessary.





## User events

Derby automates a great deal of user event handling via [model-view binding](#bindings). This should be used for any data that is tied directly to an element's attribute or HTML content. For example, as users interact with an `<input>`, value and checked properties will be updated. In addition, the `selected` attribute of `<option>` elements and edits to the innerHTML of `contenteditable` elements will update bound model objects.

For other types of user events, such as `click` or `dragover`, Derby's [`x-bind`](#dom_event_binding) attribute can be used to tie DOM events on a specific element to a callback function in the controller. Such functions must be exported on the app module.

Even if controller code is responding to a DOM event, it should typically only update the view indirectly by manipulating data in the model. Since views are bound to model data, the view will update automatically when the correct data is set. While this way of writing client code may take some getting used to, it is ultimately much simpler and less error-prone.

## Model events

[Model events](#model_events) are emitted in response to changes in the model. These may be used directly to update other model items and the resulting views, such as updating a count of the items in a list every time it is modified.



## Access control

A basic acccess control mechanism is implemented, but it isn't documented quite yet. An example is coming soon.