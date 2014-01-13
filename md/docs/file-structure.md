# File structure

## Default

The default file structure is:

    /lib
      /app
        index.js
      /server
        error.js
        index.js
    /public
    /styles
      /app
        home.styl
        index.styl
        list.styl
      /error
        index.styl
      /ui
        connectionAlert.styl
        index.styl
    /ui
      /connectionAlert
        index.html
        index.js
      index.js
    /views
      /app
        home.html
        index.html
        list.html
      /error
        403.html
        404.html
        500.html
        index.html
    .gitignore
    package.json
    Procfile
    README.md
    server.js

In [CoffeeScript](http://jashkenas.github.com/coffee-script/) projects, script
files are in the `src` directory instead.

Derby uses a filename based convention similar to Node.js modules. A file named
`demo.js` and a directory `demo` containing a file `index.js` both define an
app with the name "demo." The same applies for styles and views, which can
either be `demo.styl` or `demo\index.styl` and `demo.html` or
`demo\index.html`.

Apps are associated with their respective styles and views by filename.
Derby automatically includes them when rendering. Both support importing, so
shared styles and templates may be defined in separate files.

Static files can be placed in the public folder. (Note that the contents of the
public folder map to the root URL, so the image stored at the file
`public/img/logo.png` would be served from the URL `/img/logo.png`.)

The `ui` directory contains a component library, which can be used to create
custom components for the containing project. These are re-usable templates,
scripts, and styles that can be used to create custom HTML tags for use in
applications. General purpose component libraries can be created as separate
npm modules. See [Component Libraries](#component_libraries).