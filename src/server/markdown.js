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

function markdownCompiler(file) {
  return '<index: unminified>' + marked(file, {renderer: renderer});
};

module.exports = function(app) {
  app.viewExtensions.push('.md');
  app.compilers['.md'] = markdownCompiler;
};
