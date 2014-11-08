var marked = require('marked');
var highlight = require('highlight.js');
var derbyLanguage = require('./derbyLanguage');

highlight.registerLanguage('derby', derbyLanguage);

var renderer = new marked.Renderer();
renderer.code = function(code, language){
  // Replace double braces in code examples
  code = code.replace(/\{\{/g, '&#123;&#123;');

  if (!language) return '<pre><code>' + code + '</code></pre>';

  return '<pre class="hljs"><code class="hljs ' + language + '">' +
    highlight.highlight(language, code).value +
    '</code></pre>';
};

function markdownCompiler(file) {
  return '<index: unminified>' + marked(file, {renderer: renderer});
};

module.exports = function(app) {
  app.viewExtensions.push('.md');
  app.compilers['.md'] = markdownCompiler;
};
