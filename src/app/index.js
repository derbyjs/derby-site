var derby = require('derby');
var app = module.exports = derby.createApp('site', __filename);

global.app = app;

app.serverUse(module, 'derby-stylus');
app.loadViews(__dirname+'/../../views/app');
app.loadStyles(__dirname+'/../../styles/app');

app.get('/', function getPage(page, model){
  page.render('home');
});

app.get('/:name/:sub?', function(page, model, params, next) {
    var name = params.name;
    var sub = params.sub;
    var viewName = sub ? name + ':' + sub : name;
    console.log('render', viewName);
    page.render(viewName);
});
