var app = module.exports = require('derby').createApp('app', __filename);
app.loadViews(__dirname + '/../../views/gen');
app.loadStyles(__dirname + '/../../styles/app');

app.get('/', function(page, model) {
  model.subscribe('examples.text', function(err) {
    page.render();
  });
});

app.get('/:name', function(page, model, params, next) {
  var name = params.name;
  var names = ['docs', 'faq', 'learn', 'resources'];
  for (var i = 0; i < names.length; i++) {
    if (name === names[i]) {
      return page.render(name);
    }
  }
  next();
});