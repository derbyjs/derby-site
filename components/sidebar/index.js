module.exports = Sidebar;

function Sidebar() {}

Sidebar.prototype.view = __dirname;

Sidebar.prototype.create = function(model, dom) {
  var container = document.getElementsByClassName('main')[0];
  var headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  var html = '';
  var smallest = 5;
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var level = +header.nodeName[1];
    var link = header.id;
    var text = header.innerText;
    if (level < smallest) smallest = level;
    html += '<li><a href="#' + link + '">' + text + '</a>';
    if (i === headers.length - 1) {
      html += '</li>';
      for (var j = level; j > smallest; j--) {
        html += '</ul></li>';
      }
    } else {
      var nextLevel = +headers[i + 1].nodeName[1];
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
  this.nav.innerHTML = html;
}