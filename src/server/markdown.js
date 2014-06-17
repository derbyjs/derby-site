var marked = require('marked');
var fs = require('fs');
var path = require('path');

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

// Generate html from # Header levels
function getNavbar(levels) {
    var html = '';
    var smallest = 5;
    for (var i = 0; i < levels.length; i++) {
        var level = levels[i][0];
        var link = levels[i][1];
        var header = levels[i][2];
        if (level < smallest) smallest = level;
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

// Escape string
function toLink(text) {
    return text.toLowerCase().replace(/[^\w]+/g, '-');
}

// Parse markdown file
function parseMarkdown(mdPath) {
    var lines = fs.readFileSync(mdPath, {encoding: 'utf8'}).toString().split('\n');
    if (lines[0].indexOf('# ') !== 0) {
        throw new Error('No # Header in ' + mdPath);
    }
    var name = lines[0].substr(2);
    var description = '';
    var startLine = 0;
    for (var i = 1; i < lines.length; i++) {
        if (lines[i].indexOf('##') !== 0) {
            description += lines[i];
        } else {
            startLine = i;
            break;
        }
    }

    var isCode = false;
    var file = '';
    var levels = [];
    for (var i = startLine; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('```') === 0) {
            isCode = !isCode;
        }
        if (line[0] === '#' & !isCode) {
            var level = line.indexOf(' ');
            var header = line.substr(level + 1);
            var link = toLink(header);
            levels.push([level, link, header]);
        }
        file += line + '\n';
    }

    return {
        file: file,
        levels: levels,
        link: toLink(name),
        name: name,
        description: description
    }
}

var openTag = '{{markdown}}';
var closeTag = '{{/markdown}}';

// Replace Markdown tags with html
function processTags(from) {
    var file = fs.readFileSync(from, {encoding: 'utf8'});
    while (true) {
        var startIndex = file.indexOf(openTag);
        if (startIndex === -1) break;
        var endIndex = file.indexOf(closeTag, startIndex);
        var startText = startIndex + openTag.length;
        var markdown = file.substring(startText, endIndex);
        var html = marked(markdown);
        file = file.replace(openTag + markdown + closeTag, html);
    }
    return file;
}

var mdDir = __dirname + '/../../md';
var appDir = __dirname + '/../../views/app';
var genDir = __dirname + '/../../views/gen';

if (!fs.existsSync(genDir)) {
    fs.mkdirSync(genDir);
}

var githubPath = 'https://github.com/derbyparty/derby-site/tree/master/md';

// Replace tags in template with data from Markdown file
function processTemplate(mdPath, content, navbar) {
    var file = fs.readFileSync(appDir + '/template.html', {encoding: 'utf8'});
    var meta = parseMarkdown(mdDir + '/' + mdPath);
    file = file.replace('{{title}}', 'Derby | ' + meta.name);
    file = file.replace('{{editLink}}', githubPath + '/' + mdPath);
    file = file.replace('{{name}}', meta.name);
    file = file.replace('{{description}}', marked(meta.description));
    var navbar = navbar || getNavbar(meta.levels);
    file = file.replace('{{navbar}}', navbar);
    var content = content || marked(meta.file);
    file = file.replace('{{content}}', content);
    return file;
}


var importHtml = '';

function addToImport(name, ns) {
    if (ns) {
        importHtml += '<import: src="./' + name + '" ns="' + ns + '">\n';
    } else {
        importHtml += '<import: src="./' + name + '">\n';
    }
}

function processMarkdownDir(from, to, dirName) {
    var html = '<ul>';
    var fileNames = fs.readdirSync(from);
    for (var i = 0; i < fileNames.length; i++) {
        var fileName = fileNames[i];
        if (fileName === 'index.md') continue;
        var filePath = from + '/' + fileName;
        var meta = parseMarkdown(filePath);
        html += '<li><a href="/' + dirName + '/' + meta.link + '">' + meta.name + '</a></li>';

        var file = processTemplate(dirName + '/' + fileName);
        var name = path.basename(filePath, '.md');
        fs.writeFileSync(to + '/' + name + '.html', file);
        addToImport(dirName + '/' + name, dirName + ':' + name);
    }
    html += '</ul>';
    var file = processTemplate(dirName + '/index.md', html, ' ');
    fs.writeFileSync(to + '/index.html', file);
}

// Process /md dir
var fileNames = fs.readdirSync(mdDir);
for (var i = 0; i < fileNames.length; i++) {
    var fileName = fileNames[i];
    var filePath = mdDir + '/' + fileName;
    var stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        var to = genDir + '/' + fileName;
        if (!fs.existsSync(to)) {
            fs.mkdirSync(to);
        }
        processMarkdownDir(filePath, to, fileName);
        addToImport(fileName);

    } else {
        var name = path.basename(filePath, '.md');
        var file = processTemplate(fileName);
        fs.writeFileSync(genDir + '/' + name + '.html', file);
        addToImport(name);
    }
}

function processViewsDir(from, to) {
    var stat = fs.statSync(from);
    if (stat.isDirectory()) {
        if (!fs.existsSync(to)) {
            fs.mkdirSync(to);
        }
        var fileNames = fs.readdirSync(from);
        for (var i = 0; i < fileNames.length; i++) {
            var fileName = fileNames[i];
            processViewsDir(from + '/' + fileName, to + '/' + fileName);
        }
    } else {
        var file = processTags(from);
        if (from === appDir + '/index.html') {
            file = importHtml + file;
        }
        fs.writeFileSync(to, file);
    }
}

// Process /views dir
processViewsDir(appDir, genDir);