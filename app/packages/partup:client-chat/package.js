Package.describe({
    name: 'partup:client-chat',
    version: '0.0.1',
    summary: '',
    documentation: null
});

Package.onUse(function(api) {
    api.use([
    ], ['client', 'server']);

    api.use([
        'templating',
        'partup:lib',
        'reactive-var'
    ], 'client');

    api.addFiles([
        'ChatView.html',
        'ChatView.js',
        'ChatMessage.html',
        'ChatMessage.js',
        'ChatBar.html',
        'ChatBar.js',
        'ChatTypingIndicator.html'
    ], 'client');

});
