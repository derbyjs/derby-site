# Overview

Components are the building blocks of Derby applications. 
A component is a view associated with a controller. 
The [view](views) is implemented as a Derby template and the controller is implemented as a JavaScript [prototype function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript).

## Reusable
Components enable creating reusable UI pieces, similar to creating custom HTML elements.
Building components allows you to encapsulate complex layouts and behavior into a reusable package with clear inputs and outputs. 
In addition, they are the recommended way to break up complex applications into modular parts. It's helpful to break up application features into components, even if only used in a single place.

Just like the views, components can be rendered on the server and the client, so code written once can be rendered anywhere.

## View model
Each component has a scoped model in its own namespace. Data or references to the containing model are passed in via view attributes. This structure is similar to the Model View ViewModel (MVVM) pattern, where a component's scoped model is essentially a ViewModel.




## Example

This example shows some of the features of components. It is implemented using [derby-standalone](https://github.com/derbyjs/derby-standalone), a client-side only version of Derby that allows for prototyping in environments like CodePen. 

<p data-height="200" data-theme-id="12888" data-slug-hash="JpxGn" data-default-tab="result" data-user="enjalot" class='codepen'>See the Pen <a href='https://codepen.io/enjalot/pen/JpxGn/'>Derby-standalone example</a> by Ian (<a href='https://codepen.io/enjalot'>@enjalot</a>) on <a href='https://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

There is a slight difference in the way templates are defined in derby-standalone, so refer to the [namespaces and files](views/namespaces-and-files) documentation when implementing components in a regular Derby project.


## Web Components

While Derby components are not built on the emerging [Web Component](https://webcomponents.org/) ecosystem, they are designed with the future in mind and we look forward to embracing the standards that emerge.