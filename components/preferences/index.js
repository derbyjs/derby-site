module.exports = Preferenes;

function Preferenes() {
}

Preferenes.prototype.view = __dirname;

Preferenes.prototype.create = function (model, dom) {
  setPreferences(model);
}

Preferenes.prototype.change = function(lang, e) {
  localStorage.setItem('lang', lang);
  setPreferences(this.model);
  e.preventDefault()
}

function setPreferences(model) {
  var lang = localStorage.getItem('lang') || 'js';
  model.set('lang', lang);
  var elements = document.getElementsByTagName('code');
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (element.className === 'lang-javascript') {
      element.parentNode.style.display = lang === 'js' ? '' : 'none';
    } else if (element.className === 'lang-coffeescript') {
      element.parentNode.style.display = lang === 'js' ? 'none' : '';
    }
  }
}
