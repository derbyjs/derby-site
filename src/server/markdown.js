var marked = require('marked');
var highlight = require('highlight.js');
var derbyLanguage = require('./derbyLanguage');

highlight.registerLanguage('derby', derbyLanguage);

var renderer = new marked.Renderer();
renderer.code = function(code, language) {
  var highlighted = (language) ?
    '<pre class="hljs"><code class="hljs ' + language + '">' +
      highlight.highlight(language, code).value +
    '</code></pre>' :
    '<pre><code>' + code + '</code></pre>';

  // Replace double braces in code examples
  return highlighted.replace(/\{\{/g, '&#123;&#123;');
};
renderer.codespan = function(code) {
  return '<code>' + code.replace(/\{\{/g, '&#123;&#123;') + '</code>';
};

renderer.heading = function (text, level) {
  var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

  return '<h' + level + ' class="heading">' + 
    '<a class="anchor" name="' +
    escapedText +
    '">ANCHOR</a>' + 
    '<a class="header-link" href="#' + escapedText + '">' +
    '<svg class=" icon icon-link" width="16px" height="26px" viewBox="0 0 16 16"><path d="M16.6751679,8.69440552 C16.6751679,10.3494829 15.2700104,11.7005307 13.5366606,11.7005307 L10.3883185,11.7005307 C9.29973107,11.7005307 8.33677879,11.1660506 7.77341801,10.3552389 C7.21106344,11.165004 6.24985876,11.7005307 5.15856569,11.7005307 L2.01022357,11.7005307 C0.282787373,11.7005307 -1.12828377,10.3546426 -1.12828377,8.69440552 L-1.12828377,8.03036154 C-1.12828377,6.37528412 0.276873826,5.02423633 2.01022357,5.02423633 L5.15856569,5.02423633 C6.2471531,5.02423633 7.21010539,5.55871644 7.77346616,6.36952817 C8.33582074,5.55976302 9.29702541,5.02423633 10.3883185,5.02423633 L13.5366606,5.02423633 C15.2640968,5.02423633 16.6751679,6.37012443 16.6751679,8.03036154 Z M10.3883185,9.6986199 L13.5366606,9.6986199 C14.1098221,9.6986199 14.5806442,9.24712236 14.5806442,8.69440552 L14.5806442,8.03036154 C14.5806442,7.47733202 14.1089772,7.02614715 13.5366606,7.02614715 L10.3883185,7.02614715 C10.013397,7.02614715 9.68226484,7.21933609 9.49806053,7.50766918 L11.0086429,7.50766918 C11.5870296,7.50766918 12.0231864,7.80957115 12.0231864,8.36238356 C12.0231864,8.91519597 11.5870296,9.21709788 11.0086429,9.21709788 L9.49817009,9.21709788 C9.68253891,9.50550171 10.0138884,9.6986199 10.3883185,9.6986199 Z M2.01022357,9.6986199 L5.15856569,9.6986199 C5.53348723,9.6986199 5.86461934,9.50543097 6.04882365,9.21709788 L4.60367807,9.21709788 C4.02529131,9.21709788 3.52369782,8.91519597 3.52369782,8.36238356 C3.52369782,7.80957115 4.0252913,7.50766918 4.60367806,7.50766918 L6.04871408,7.50766918 C5.86434526,7.21926535 5.53299573,7.02614715 5.15856569,7.02614715 L2.01022357,7.02614715 C1.43706212,7.02614715 0.966239961,7.4776447 0.966239961,8.03036154 L0.966239961,8.69440552 C0.966239961,9.24743504 1.43790694,9.6986199 2.01022357,9.6986199 Z M2.01022357,9.6986199" fill="#3F484B" transform="translate(7.773442, 8.362384) rotate(-45.000000) translate(-7.773442, -8.362384) "></path></svg>' + 
    //'LINK' + 
    '</a>' +
    text + 
    '</h' + level + '>';
};

markedOptions = {
  renderer: renderer,
  gfm: true,
  tables: true,

  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false 
}
marked.setOptions(markedOptions)
function markdownCompiler(file) {
  return '<index: unminified>' + marked(file);
};

module.exports = function(app) {
  app.viewExtensions.push('.md');
  app.compilers['.md'] = markdownCompiler;
};
