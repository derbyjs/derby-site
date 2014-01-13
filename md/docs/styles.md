# Styles

CSS

## Stylesheets

Derby uses **[Stylus](http://learnboost.github.com/stylus/)** and/or **[LESS](http://lesscss.org/)** to automatically compile and includes styles for each page. Both of these languages extend CSS with variables, mixins, functions, and other awesome features.

Derby also includes **[Nib](http://visionmedia.github.com/nib/)** with Stylus, which adds a number of convenient CSS3 mixins. Nib takes care of adding vendor prefixes, makes CSS gradients *much* easier, and has bunch of other useful features.

Stylus requires that files end in a `.styl` extension. It supports [importing other files](http://learnboost.github.com/stylus/docs/import.html), including support for `index.styl` files. Since Node.js, Derby templates, and Stylus all support similar file importing conventions, it is easy to use the same directory structure for analogous files in the `lib`/`src`, `views`, and `styles` directories.

Derby includes compiled CSS at the top of each page. Inlining CSS almost always decreases load time, and Stylus or LESS importing makes it easy to break up shared styles into files included in the appropriate pages. Note, however, that it is not optimal to include a very large amount of CSS, such as large data URI encoded images, at the top of the page. Large images are best loaded as separate files or inline at the bottom of the page, so that the rest of the page may be displayed first.