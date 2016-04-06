Package.describe({
    name: 'partup:client-forminputs',
    version: '0.0.1',
    summary: '',
    documentation: null
});

Package.onUse(function(api) {
    api.use([
        'templating',
        'reactive-var',
        'partup:lib'
    ], 'client');

    api.addFiles([
        'fileinput.html',
        'fileinput.js',
        'datepicker.html',
        'datepicker.js',
        'multi-invite-input.html',
        'multi-invite-input.js',
        'wysiwyg.html',
        'wysiwyg.js'
    ], 'client');
});
