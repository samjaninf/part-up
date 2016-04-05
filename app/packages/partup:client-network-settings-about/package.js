Package.describe({
    name: 'partup:client-network-settings-about',
    version: '0.0.1',
    summary: '',
    documentation: null
});

Package.onUse(function(api) {
    api.use([
        'partup:lib'
    ], ['client', 'server']);

    api.use([
        'templating',
        'aldeed:autoform'
    ], 'client');

    api.addFiles([

        'NetworkSettingsAbout.html',
        'NetworkSettingsAbout.js'

    ], 'client');

});
