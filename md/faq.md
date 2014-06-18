### What if I have not found an answer?

These are just a few of the frequently asked questions. This is a work in progress. If your question is not answered here, please search over on the [Google Group](https://groups.google.com/forum/?fromgroups#!forum/derbyjs). If you don't see an existing question, then let us know what is wrong. Please be as straightforward as possible, and provide any related code snippets.

### What is Derby application?

Derby app is extended Express app. You can use Connect, Express router, etc, as you do in common Express app. Some of Connect modules are parts of Derby app - this is the way Derby extends Express.  
Also Derby app has one or more client apps. Each client app has its own router, templates, styles, browserify modules, Model. Client app executes on server while first request and also its uploads to client and executes in browser. Only one client app can be in browser at unit of time.

### How request is processed?

Client app router is located above Express router in Connect middleware. If request is catched by client app router, client app executes on server, generates html and sends it back to browser with styles and client app js. As soon as client app js is uploaded to browser, all next url changes catched by client app router in browser and html generates also there.  
If client app router can not catch request url, request falls down to Express router. Client app router has only GET method, Experss app router has all methods. Usually Express router is used for uploading files, POST requests, showing errors etc.

### What if js is disabled?

If js is disabled in browser, client app router triggers on server for every url change. In this case site looks more like static one.  
Search engine spiders also get html which is good for SEO.

### What is Model?

Model is js-object that provides us api for data. All data manipulations are done through it. Model can exist on server and on client. While processing request from client, Derby creates Model, use it in client app router on server, serializes Model, upload JSON to client, deserializes it and recreates Model with state equal to those on server. Models are created on server for each request and also you can create any number of Models directly from Store anytime, but there is only one Model on client.

### What is fetch and subscribe?

Once created Model is empty. It means that there is no data in it. Before you can use any data from database, you should fill it into Model. There are two ways: fetch - just fills Model with some data, subscribe - dynamically binds Model with some data in database, if this data changes in database, data in your Model will be updated. You can fetch/subscribe whole collection, particular document, just one field in document. There are also ways to fetch/subscribe certain documents with use of Queries.

### What is Store?

Store is singular js-object on server. All Models are created from Store. Store connected to all Models. If Model is on client, connection established by racer-browserchannel. Store is wrapper on ShareJS and a place where all OT conflict resolution magic is happen.

### What is Racer?

Racer is data manipulation layer in Derby, wrapper on ShareJS. Model and Store are parts of Racer. You can use Racer without Derby.

### What is OT?

OT - Operational Transformation - conflict resolution technique used in ShareJS. Main idea is that each operation recieved from client before being executed on data, transforms according to previous operations for this data (if there were any). If two clients send operations on same data at same time, ShareJS will execute first recieved operation and before executing second, it will transform second operation according to first operation, so second operation data changes will consider that data was already changed by first operation.  
OT is different for different data types. ShareJS uses json data type in Racer. Also there is text data type in ShareJS and plans to add rich text data type.
Using Derby you can treat OT like black box with some magic. ShareJS will merge operations for arrays, strings, number increments 'out of the box', but if two clients make set operation for same data at same time (data with same version) there is no way to capture this correcly and one of two operations will be lost. If it is critical (and you have a big head), you can create application specific data types for ShareJS.

### Why do we need two databases?

For data synchronization between clients we need some kind of database events to be aware if data is changed. If we implement these events in app code, there would not be way to scale app to more than one process. Another way is to use database PubSub. Mongo has limited PubSub, so there is no way to use it for most of applications. Another story is Redis - fast, full PubSub. So LiveDB (data store for ShareJS) stores data in Mongo, but uses Redis PubSub to synchronize clients. Also there is cache of last operations in Redis. And we can store history of all operations in same Mongo database as data (by default), in another one or do not store operations at all.  
There is easy way to change Mongo to something else, you just need to write adapter like livedb-mongo. Changing Redis is not trivial thing.

### Why racer-browserchanel uses long pooling and not web sockets?

Web sockets does not guarantee order of messages between client and server, which is critical for OT.

### What kind of projects Derby is suitable for?

Derby is good for most kinds of projects. You can use it for static sites without database as for multiplayer real-time games and big interactive sites.

### How can we limit access to data?

There is Racer plugin: racer-access. You can restrict access to collection and document. There is no way to limit access to particular fields of document.

### What about authorization?

Derby + Everyauth have some problems with login/password authorization. So recomendation - to use Passport. There are derby-auth and derby-passport modules, which are suitable for most Derby apps.

### Why there are two collections in derby-auth?

There is no way to restrict access in Derby for some fields of documents and allow it for another fields of same documents. So there is no way to restrict access to user password and allow access to user name using one collection. So derby-auth uses two collections: auth - for passwords, users - for everything else.

### Can I use Derby in Phonegap?

Starting from version 0.6 - yes, you can.

### Is there way to run server code from client?

You can use server-hooks (events for data changes) or send post request to express router to execute some code.

------


FAQ по Derby 0.6 (на русском)
=====================

В этом репозитории я буду собирать часто задаваемые вопросы, а так же всевозможные тонкости [derbyjs](http://derbyjs.com)

### Как я могу добавить что-то в FAQ?

Напишите мне @zag2art сообщение через гитхаб или на почту (zag2art@gmail.com), а лучше сделайте форк, добавьте информацию и посылайте пулл-реквест.

### У меня есть вопрос, ответа я не знаю, но думаю всем бы было полезно

Оформляйте [issue](https://github.com/zag2art/derby-faq-ru/issues) в данном репозитории - постараюсь ответить, и если посчитаю вопрос достаточно интересным и общим - добавлю его в FAQ.

## Общая информация

#### Как на данный момент лучше всего изучать derby 0.6?

Проработать туториалы:

1. [Изучаем Derby 0.6, пример #1](http://habrahabr.ru/post/221027/)
2. [Изучаем Derby 0.6, пример #2](http://habrahabr.ru/post/221703/)
3. [Изучаем Derby 0.6, пример #3](http://habrahabr.ru/post/222399/)
4. [Введине в компоненты derby 0.6](http://habrahabr.ru/post/224831/)

Далее изучить примеры из [derby-examples](https://github.com/codeparty/derby-examples)

---
#### Что нужно знать до начала изучения derby.js?

1. необходимы базовые знания по веб-разработке (html, css, javascript);
2. nodejs — нужно понимать commonjs-модули, npm, знать, как запустить стандартный http-сервер;
3. expressjs — приложения derby строятся поверх приложений express, поэтому хорошо бы иметь об экспресс и серверном js какие-то базовые знания (подключение модулей, обработка запроссов и т.д.)

По nodejs и expressjs я бы посоветовал пройти курс [Ильи Кантора](http://learn.javascript.ru/nodejs-screencast) с обязательной практикой.

---
## Запросы

#### Как сделать реактивный запрос к количеству элементов в коллекции (сами элементы мне не нужны)?

```js
  var topicsCount = model.query('topics', {
    $count: true,
    $query: {
      active: true
    }
  });

  model.subscribe(tipicsCount, function(){
    topicsCount.refExtra('_page.topicsCount');

    // ...
  });
```

---
#### Как подписаться на определенные элементы коллекции (у меня уже есть реактивный список id, нужных элементов)?

В model.query обычно передаются 2 параметра, имя коллекции и объект с параметрами запроса, но есть еще один синтаксис:
```js
model.query(collection, path)
```

Здесь path - это путь к массиву id-шников документов, например, "_page.userIds", причем сам массив, вполне себе может быть реактивным.

Для чего это может быть нужно. Представьте себе чат, мы выводим страницу с одной из комнат чата. Туда постоянно входят новые люди, что-то там пишут. В сообщениях чата мы храним только id юзера, а остальная информация хранится в коллекции users. Естественно, для вывода сообщений имена юзеров нам нужны. Всех юзеров грузить на клиента смысла нет, нужны только те, сообщения которых есть в нашей комнате.

Cделаем так:
 1. подпишемся на сообщения в комнате,
 2. запустим реактивную функцию, которая будет собирать id всех юзеров, от которых в нашей комнате есть сообщения,
 3. подпишемся на коллекцию users, используя в качестве списка id, результат выполнения реактивной функции

```js
app.get('/chat/:room', function(page, model, params, next){
  var room = params.room;

  var messages = model.query('messages', {room: room});

  model.subscribe(messages, function(){

    messages.ref('_page.messages');

    // Запускаем реактивную функцию, она будет срабатывать при изменении messages
    // и записывать id-шки всех user-ов в _page.userIds

    model.start('_page.userIds', 'messages', 'pluckUserIds');

    var users = model.query('users', '_page.userIds');

    model.subscribe(users, function(){
      // ...
      page.render();
    });
  });
}

// Реактивные функции необходимо регистрировать после того,
// как модель создана
app.on('model', function(model){
  model.fn('pluckUserIds', function (messages) {
    var ids = {};

    for (var key in messages) ids[messages[key].userId] = true;

    return Object.keys(ids);
  });
});
```

---
#### Как получить не сами элементы коллекции, а только их id?
```js
  var query = model.query('topics');

  model.subscribe(query, function(){
    query.refIds('_page.topicIds');
  });
```
---
  Но необходимо учитывать, что сама коллекция topics в данном случае будет копироваться в браузер, чтобы этого избежать используйте проекции. В серверной части derby, в server.js определите проекцию для коллекции topics:
```
  store.shareClient.backend.addProjection("topicIds", "topics", "json0", {id: true});
```
  Далее с проекцией можно работать, как с обычной коллекцией.
```js
  var query = model.query('topicsIds');

  model.subscribe(query, function(){
    query.refIds('_page.topicIds');
  });
```
---
## Компоненты

#### Как в шаблонах компонент получить доступ к корневой области видимости модели?

Как известно, в компонентах своя, изолированная область видимости, поэтому для доступа к корню необходимо использовать префикс #root, например:
```html
<ul>
  {{each #root._page.topics as #topic}}
    <!-- ... -->
  {{/}}
<ul>
```
---
#### Как в коде компонент получить доступ к корневой области видимости модели?

Как известно, в компонентах своя, изолированная область видимости, поэтому, чтобы обратиться к корневой модели, вместо model, здесь необходимо использовать model.root либо доставать корневую модель из app. Например:
```js
function MyComponent() {}

MyComponent.prototype.init = function(model){
  // model.get('_page.topics') работать не будет
  var topics = model.root.get('_page.topics');
  // ...

}

MyComponent.prototype.onClick = function(event, element){
  var topics = this.model.root.get('_page.topics');
  // То же самое можно сделать так:
  var topics = this.app.model.get('_page.topics');
  // ...

}
```
---
#### Как в компоненте связать результаты запроса с локальным (для компонента) путем в модели?

```javascript
app.get('/', function(page) {
  page.render('home');
});

function Home() {}

app.component('home', Home);

Home.prototype.view = __dirname + '/home.html';
Home.prototype.create = function(model) {
  // var $query = model.query('somedata', {});  Так создание ссылок не работает
  var $query = model.root.query('somedata', {}); // a так работает
  model.subscribe($query, function() {
      model.ref('items', $query);
      // теперь в шаблоне компонента можно использовать локальный путь items
  });
}
```
home.html
```html
<index:>
  <ul>
    {{each items}}
    <li>{{this.title}}</li>
    {{/}}
  </ul>
```

---
## Модель

#### Мне не нужны все поля коллекции в браузере, как получать только определенные поля (проекцию коллекции)?

В серверной части derby-приложения прописываются все проекции:
```js
store.shareClient.backend.addProjection("topic_headers", "topics", "json0", {
  id: true,
  header: true,
  autor: true,
  createAt: true
});

store.shareClient.backend.addProjection("users", "auth", "json0", {
  id: true,
  username: true,
  email: true
});
```
Далее с проекциями users и topic_headers в derby-приложении можно работать, как с обычными коллекциями.
```js
model.subscribe('users' function(){
  model.ref('_page.users', 'users');
  // ...
});
```
При создании проекций обратите внимание: поле id обязательно, пока поддерживается только белый список полей (перечисляем только поля, которые должны попасть в проекцию), так же поддерживается пока только возможность задавать поля первого уровня вложенности.

---
## База данных

#### Говорят появилась возможность обходится без redis-а, используя только mongodb, как это сделать?

В серверной части derby-приложения в момент создания объекта store необходимо прописать только mongodb-данные:
```js
  var store = derby.createStore({
    db: liveDbMongo(mongoUrl + '?auto_reconnect', {safe: true})
  });
```

Но стоит учесть то, что redis необходим, если вы планируете горизонтальное масштабирование (запускать несколько derby-серверов параллельно).

---
#### А что делать, если у меня уже есть готовая mongodb-база данных, ее можно использовать с derby?

Ее можно будет использовать только после небольшой обработки. Дело в том, что для разрешения конфликтов в derby используется модуль [sharejs](http://sharejs.org/), он добавляет к каждой записи в коллекции вспомогательные данные: номер версии, тип объекта (в понимании sharejs) и т.д. Так же для хранения журнала операций рядом с каждой коллекцией создается еще одна с суффиксом "ops", например, "users_ops". Так вот, этот журнал тоже требует инициализации. За нас все это уже, конечно, автоматизировано в модуле - [igor](https://github.com/share/igor)

```bash
npm install igor

coffee itsalive.coffee --db project
```
Подробней смотрите на странице [модуля](https://github.com/share/igor)

---
## Стили

#### Как в derby использовать less-стили?

Начиная с версии derby 0.6.0-alpha9, блок, отвечающий за компиляцию less-файлов в css, вынесен в отдельный модуль derby-less.

Теперь, чтобы использовать, его нужно сначала подключить к проекту:
```bash
npm install derby-less
```
далее в js-файле вашего приложения нужно прописать:
```js
// Добавляем поддержку Less
app.serverUse(module, 'derby-less');
```
Причем эта строка должна быть раньше любого вызова app.loadStyles()

Например, так:
```js
var derby = require('derby');
var app = module.exports = derby.createApp('example', __filename);

// Add Less support (before loadStyles)
app.serverUse(module, 'derby-less');

app.loadViews (__dirname);
app.loadStyles(__dirname);

app.get('/', function(page, model) {
  page.render();
});
```

Все, теперь вместо css-файлов можно использовать less-файлы.

---
#### Как в derby использовать stylus-стили?

Все абсолютно то же самое, что и для less, только модуль называется derby-stylus

---
## View'хи

#### Как вставить в шаблон неэкранированный html или текст?

Необходимо использовать unescaped модификатор, например:
```html
<header>
  {{topic.header}}
<header>

<!-- topic.unescapedTitle сделал только для примера, не знаю зачем такое может понадобиться -->
<article title="{{unescaped topic.unescapedTitle}}">
  {{unescaped topic.html}}
</article>
```

Учитывайте то, что это - потенциальная дыра в безопасности. Ваши данные должны быть полностью отчищены от опасных тегов, данные для атрибутов должны быть экранированы. В общем, прежде чем использовать такое, убедитесь, что вы понимаете, что делаете.

---
#### Как в шаблоне определенный блок сделать нереактивным (чтобы он не обновлялся сразу при изменении данных в модели)?

Во-первых, стоит сказать о том, что если нам в приложении вообще не нужна реактивность, то вместо подписки на данные нам стоит просто запрашивать их текущее состояние - вместо model.subscribe делать model.fetch.
```js
  // Так данные будут реактивно обновляться
  model.subscribe('topics', function(){
    // ...
  });

  // А так не будут
  model.fetch('topics', function(){
    // ...
  });
```
Важно понимать, что здесь мы пока говорим только о модели и только об обновлениях, приходящих с сервера. Важно, что сделав fetch, если мы что-то добавили в коллекцию, использовав model.add - наши данные вполне себе попадут на сервер в б.д., с другой стороны, если данные в коллекцию добавил кто-то другой - они к нам не придут.

Теперь поговорим о реактивности html-шаблонов, по умолчанию, все привязки к данным там реактивные, то есть, как только поменялись данные в модели (не важно пришли ли обновления с сервера, или модель изменена кодом), изменения сразу же отразятся в html-шаблоне, но этим можно управлять.

Для управления реактивностью в шаблонах, используются такие зарезервированные слова, как bound и unbound, их можно использовать как в блочной нотации, так и в виде модификатора для выражений. Продемонстрирую:

```html
<p>
  <!-- по умолчанию привязка рекативная-->
  {{_page.text}}
</p>
<p>
  <!-- явно заданная реактивная привязка-->
  {{bound _page.text}}
</p>

<!-- Внутри этого блока все привязки по-молчанию реактивные -->
{{bound}}
  <p>
    <!-- прявязка реактивная, так как лежит внутри bound-блока-->
    {{_page.text}}
  </p>
  <p>
    <!-- прявязка не реактивная, так как это указано явно-->
    {{unbound _page.text2}}
  </p>
{{/}}

{{unbound}}
  <p>
    <!-- прявязка не реактивная, так как лежит внутри unbound-блока-->
    {{_page.text}}
  </p>

  <p>
    <!-- прявязка реактивная, так как это указано явно-->
    {{bound _page.text}}
  </p>
{{/}}

```

Естественно, для удобства, блоки могут быть вложены один в другой.

---
#### Как в шаблоне сделать так, чтобы в определенный момент обновился нереактивный блок?

Для того, чтобы в определенный момент перерисовать unbound-блок, нужно использовать ключевое слово on, примерно так:

```html
{{on _page.trigger}}
  {{unbound}}
    <!-- нереактивный html -->
  {{/}}
{{/}}

<!-- кнопка, по которой будем все это обновлять -->
<a href="#" on-click="refresh()">Refresh</a>
```
Нажатии на кнопку изменяем _page.trigger:
```js
app.proto.refresh = function(){
  app.model.set('_page.trigger', !app.model.get('_page.trigger'))
}
```
---
#### Как привязать реактивную переменную к элементу select?

Никаких событий ловить не понадобится, derby все делает за нас. Изучите пример:

```html
<!-- в массиве _page.filters находятся объекты с полями id и name - идентификатор-->
<!-- соответствующего фильтра и имя -->

<select>
  {{each _page.filters as #filter}}
      <option selected="{{_page.filterId === #filter.id}}" value="{{#filter.id}}">
        {{#filter.name}}
      </option>
  {{/}}
</select>
```

В результате выбора в _page.filterId будет лежать id выбранного по имени фильтра.

При реактивной привязке к option-у, derby предолагает, что встретит в атрибуте selected выражение проверки на равенство (сами равенства нужны для первоначальной установки занчения). Пердполагается, что левым параметром проверки на равенство будет путь, который обновится значением из атрибута value соответствующего option-а, при его выборе пользователем.

---
#### Как привязать реактивную переменную к элементу input type=radio?

Никаких событий ловить не понадобится, derby все делает за нас:

```html
<label>
<input type="radio" name="opt" value="one"   checked="{{_page.radioVal === 'one'  }}">One
</label>
<label>
<input type="radio" name="opt" value="two"   checked="{{_page.radioVal === 'two'  }}">Two
</label>
<label>
<input type="radio" name="opt" value="three" checked="{{_page.radioVal === 'three'}}">Three
</label>
```

В результате выбора в _page.radioVal будет либо 'one', либо 'two', либо 'three', в зависимости от того, что выберет пользователь.

При реактивной привязке к input-у c типом radio, derby предолагает, что встретит в атрибуте checked выражение проверки на равенство (сами равенства нужны для первоначальной установки занчения). Пердполагается, что левым параметром проверки на равенство будет путь, который обновится значением из атрибута value соответствующего input-а, при его выборе пользователем.

---
#### Как привязать реактивную переменную к элементу textarea?

Все очень просто:

так было до 0.6.0-alpha6
```html
 <textarea value="{{message}}"></textarea>
```
так стало, начиная от 0.6.0-alpha6
```html
 <textarea>{{message}}</textarea>
```

---

## События

#### Как получить доступ к объекту event в обработчике событий?

Необходимо в функцию-обработчик события передать дополнительный, предопределенный параметр $event
```html
<a href="http://derbyjs.com" on-click="click($event)">
```
```js
app.proto.click = function(e) {
  e.preventDefault();

  // ..
}
```

---
#### Как получить доступ к dom-элементу в обработчике событий?

Необходимо в функцию-обработчик события передать дополнительный, предопределенный параметр $element
```html
<a href="http://derbyjs.com" on-click="click($event, $element)">
```
```js
app.proto.click = function(e, el) {
  e.preventDefault();

  $(el.target).hide();
  // ..
}
```

---
#### Есть ли в derby 0.6 обработчик, аналогичный app.ready в derby 0.5, срабатывющий всего один раз в браузере, в самом начале, нужный для инициализации клиентских скриптов?

Этот обработчик теперь находтся в app.proto.create. Проиллюстрирую:

index.js
```js
// ...

// Вызывается в браузере после рендеринга первой страницы
// (вызовется всего один раз)
app.proto.create = function(model){
  // Инициализируем jQuery AJAX
  $.ajaxSetup({
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    processData: false
  });
}
```

---
#### В derby 0.5 был обработчик app.enter, в котором можно было отловить момент создания страницы, а как это сделать в derby 0.6?

Чтобы отлавливать момент создания страницы (когда dom уже сформирован) необходимо, чтобы каждая страница была компонентом. В компонете для этого используется метод create.

В полном виде подход выглядет примерно так:

index.html
```html
<!-- точка входа - это наш лейаут -->
<import: src="./home">
<import: src="./about">

<Body:>
  <!-- здесь будет header -->

  <!-- сюда будет генерится контент страниц -->
  <view name="{{$render.ns}}"/>

  <!-- здесь будет footer -->
```
home.html - страница home будет отдельным компонентом
```html
<index:>
  <h1> Home </h1>
  <!-- ... -->
```

about.html - страница about будет отдельным компонентом
```html
<index:>
  <h1> About </h1>
  <!-- ... -->
```
index.js
```js
// ...

app.component('home',  Home);
app.component('about', About);

function Home (){};
function About(){};

Home.prototype.create = function(model, dom){
  // страница отрендерина
}

About.prototype.create = function(model, dom){
  // страница отрендерина
}

// ...

app.get('/', function(page){
  page.render('home');
});

app.get('/about', function(page){
  page.render('about');
});
```

---
#### Как в компоненте подписаться на событие не всего document'a, а необходимого контрола?

Для этого необходимо указать параметр target (в примере это self.input) при подписывании на событие, например:

View:
```html
<index: element='demo'>
    <input as='input' type='text' value="{{@value}}" />
```
Code:
```js
module.exports = Demo;

function Demo() {
}

Demo.prototype.view = __dirname + '/demo.html';

Demo.prototype.create = function (model, dom) {
    var self = this;
    dom.on('keydown', self.input, function (e) {
        if (e.keyCode === 13) {

        }
    });
};
```

---

## Модули

#### Как к derby подключить шаблонизатор jade?
Для подключения jade к дерби необходимо использовать модуль [derby-jade](https://github.com/cray0000/derby-jade).

Устанавливаем его:
```bash
npm install derby-jade
```
В derby-приложении до использования app.loadViews() необходимо подключить этот модуль вот таким образом:
```js
app.serverUse(module, 'derby-jade');
```
Убедитесь, что у вас derby версии не младше 0.6.0-alpha7

---
#### Какой модуль использовать для авторизации в derby?

Используйте, надавно созданный специально под 0.6 версию derby, модуль [derby-login](https://github.com/vmakhaev/derby-login).

Доступна регистрация/авторизация через соц. сети, ведь внутри этот модуль использует [passportjs](passportjs.org).

---
#### Как подключать клиентские скрипты к derby-приложение, например, jquery?

Если скрипт находится на где-то на cdn-сервере, можно подключить его, просто вставив в html-шаблон тег script, например:

```html
<Body:>
  <!-- ... -->
  <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
```
Можно, конечно, сюда засунуть и сам скрипт, но лучше воспользоваться для этого предоставляемым browserify интерфейсом. Этот способ хорош еще и тем, что скрипт попадает в "бандл", который к странице подтягивается вторым запросом (после самого html-я страницы со встроенными стилями), что дает высокую скорость отрисовки.

Итак, рекомендуемый способ:

```js
// на серверной стороне derby? в файле server.js

store.on('bundle', function(browserify){
  // ваш локальный путь до файла скрипта
  browserify.add("../js/minified/jquery-1.11.0.min.js");
});
```

У себя для подключения клиентских скриптов, мы бычно используем bower, далее в grunt-e у нас настроены задачи по минификации и конкатенации всех вендорских скриптов в один. Итоговый vendor.min.js мы подключаем, используя вышеизложенный метод.

---
## Написание модулей

#### Как проверить, что код в derby-приложении выполняется на клиенте/на сервере?

В derby есть модуль с утилитами, в нем присутствуют нужные нам флаги:
```js
var derby = require('derby');

if (derby.util.isServer) {
  // код, который должен выполняться,
  // только если мы находимся на сервере
}

if (!derby.util.isServer) {
  // код, который должен выполняться,
  // только если мы находимся на клиенте
}
```

---
#### Как сделать require модуля в derby-приложении, код которого будет выполняться только на сервере?

Объясню сначала в чем вообще особенность require модулей, которые нужны нам только для сервера. Дело в том, что все модули derby-приложения, которые подключаются к нему через классическое CommonJS-ное require полюбому попадают в "бандл", а следовательно будут копироваться в браузер к клинету. Нам же не особо хочется, чтобы в браузер попадали лишние данные, тем более, если модуль заведомо нужен только для работы на сервере. Поэтому вместо require используем serverRequire из набора утилит derby:

```js
var derby = require('derby');

if (derby.util.isServer) {
  // Пакет точно не попадет к клиентам в браузер
  var myPackage = derby.util.serverRequire('mypackage');
  // ...
}
```

---
#### Как проверить, что приложение выполняется в режими промышленной эксплуатации (isProduction)?

И на клиенте, и на сервере доступен флаг derby.util.isProduction. Если заглянуть внутрь util мы увидем, что флаг этот устанавливается стандартным для nodejs способом.

```js
  var isProduction = process.env.NODE_ENV === 'production';
```

Для этого используется переменная окружения NODE_ENV - установите ее, если нужно.

Пример использования (можно и на клиенте и на сервере):

```js
  if (derby.util.isProduction) {
    // ...
  } else {
    // ...
  }
```