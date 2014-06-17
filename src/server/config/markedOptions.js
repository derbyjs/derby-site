module.exports = {
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
}