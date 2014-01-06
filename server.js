var marked = require('marked');
var fs = require('fs');

// Synchronous highlighting with highlight.js
marked.setOptions({
  breaks: true,
  highlight: function (code, lang) {
    if (lang) {
      // highlight.js does not know html, but xml
      if (lang === 'html') lang = 'xml';
      code = require('highlight.js').highlight(lang, code).value;
    } else {
      code = require('highlight.js').highlightAuto(code).value;
    }

    // replace Derby template engine brackets in code examples
    code = code.replace(/\{\{/g, '&#123;'); //actually &#123;&#123;
    code = code.replace(/\}\}/g, '&#125;&#125;');

    // new lines
    return code.replace(/\n/g, '<br>');
  }
});

function getNavbar(levels) {
  var html = '';
  var smallest = 5;
  for (var i = 0; i < levels.length; i++) {
    var level = levels[i][0];
    var header = levels[i][1];
    if (level < smallest) smallest = level;
    var link = header.toLowerCase().replace(/[^\w]+/g, '-');
    html += '<li><a href="#' + link + '">' + header + '</a>';
    if (i === levels.length - 1) {
      html += '</li>';
      for (var j = level; j > smallest; j--) {
        html += '</ul></li>';
      }
    } else {
      var nextLevel = levels[i + 1][0];
      if (level < nextLevel) {
        html += '<ul class="nav">';
      } else {
        html += '</li>';
      }
      if (level > nextLevel) {
        html += '</ul></li>';
      }
    }
  }
  return html;
}

function getLevels(mdPath) {
  var lines = fs.readFileSync(mdPath).toString().split('\n');
  var isCode = false;
  var levels = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.indexOf('```') === 0) {
      isCode = !isCode;
    }
    if (line[0] === '#' & !isCode) {
      var level = line.indexOf(' ');
      var header = line.substr(level + 1);
      levels.push([level, header]);
    }
  }
  return levels;
}

var openTag = '{{markdown}}';
var closeTag = '{{/markdown}}';

function markdown (from, to) {
  var file = fs.readFileSync(from, {encoding: 'utf8'});
  while(true) {
    var startIndex = file.indexOf(openTag);
    if (startIndex === -1) break;
    var endIndex = file.indexOf(closeTag, startIndex);
    var startText = startIndex + openTag.length;
    var markdown = file.substring(startText, endIndex);
    var html = marked(markdown);
    file = file.replace(openTag + markdown + closeTag, html);
  }

  var names = ['docs', 'faq', 'learn', 'resources'];
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    if (from === __dirname + '/views/app/' + name + '.html') {
      var mdPath = __dirname + '/md/' + name + '.md';
      var levels = getLevels(mdPath);
      var navbar = getNavbar(levels);
      file = file.replace('{{navbar}}', navbar);
      var md = fs.readFileSync(mdPath, {encoding: 'utf8'});
      var content = marked(md);
      file = file.replace('{{content}}', content);
    }
  }
  fs.writeFileSync(to, file);
}

function readPath (from, to) {
  var stat = fs.statSync(from);
  if (stat.isDirectory()) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to);
    }
    var fileNames = fs.readdirSync(from);
    for (var i = 0; i < fileNames.length; i++) {
      readPath(from + '/' + fileNames[i], to + '/' + fileNames[i]);
    }
  } else {
    markdown(from, to);
  }
}

readPath(__dirname + '/views/app', __dirname + '/views/gen');


var app = require('./lib/app');
var options = {
  'static': __dirname + '/public'
};

require('./lib').run(app, options);