Template.registerHelper('partupImageUrl', function(options) {
    if (!options || !options.hash || !options.hash.id) return '';

    var image = Images.findOne({_id: options.hash.id});
    if (!image) return;

    var store = options.hash.store || '360x360';
    return Partup.helpers.url.getImageUrl(image, store);
});

Template.registerHelper('partupImageObjectUrl', function(options) {
    if (!options || !options.hash || !options.hash.object) return '';

    var store = options.hash.store || '360x360';
    return Partup.helpers.url.getImageUrl(options.hash.object, store);
});
