Package.describe({
    name: 'partup:client-filestack-uploader',
    version: '0.0.1',
    summary: '',
    documentation: null
});

Package.onUse(function(api) {

    api.use([
        'templating',
        'partup:lib'
    ], 'client');


    api.addFiles([

        'filepicker.min.js',

        'FilestackUploader.html',
        'FilestackUploader.ctrl.js'

    ], 'client');

});
