var moment = require('moment');

module.exports = Chat;

function Chat() {
}

Chat.prototype.view = __dirname;

Chat.prototype.init = function (model) {
    var $messagesQuery = model.root.query('messages', {});
    model.ref('messages', $messagesQuery);
    model.ref('users', model.root.filter('users', 'online'));
}

Chat.prototype.message = function (e) {
    var model = this.model;
    if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        var text = model.del('text');
        if (text && text.length > 0) {
            var message = {
                text: text,
                userId: model.root.get('_session.userId')
            }
            model.add('messages', message);
        }
    }
}

Chat.prototype.username = function (userId) {
    var model = this.model;
    var username = model.root.get('users.' + userId + '.username');
    var text = model.get('text') || '';
    text += '@' + username + ', ';
    model.set('text', text);
    this.text.focus();
    this.text.setSelectionRange(text.length, text.length);
}

Chat.prototype.date = function (date) {
    return moment(date).format('H:m');
}