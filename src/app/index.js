var derby = require('derby');
var app = module.exports = derby.createApp('site', __filename);

global.app = app;

app.loadViews (__dirname+'/../../views');
app.loadStyles(__dirname+'/../../styles');

app.get('/', function getPage(page, model){
  page.render();
});

app.get('/:name/:sub?', function(page, model, params, next) {
    var name = params.name;
    var sub = params.sub;
    var viewName = sub ? name + ':' + sub : name;

    page.render(viewName);
});
