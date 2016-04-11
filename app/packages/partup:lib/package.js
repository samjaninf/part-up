Package.describe({
    name: 'partup:lib',
    version: '0.0.1',
    summary: '',
    git: '',
    documentation: null
});

Package.onUse(function(api) {
    api.use([
        'stevezhu:lodash',
        'mongo',
        'tracker',
        'aldeed:simple-schema',
        'aldeed:autoform',
        'chrismbeckett:toastr',
        'momentjs:moment',
        'matb33:collection-hooks',
        'partup:client-copy-to-clipboard',
        'lifely:mout',
        'iron:router',
        'http'
    ]);

    api.use([
        'templating'
    ], 'client');

    api.addFiles([
        'namespace.js',
        'version.js',
        'globals.js',
        'routes.js',
        'services/location.js',
        'services/placeholder.js',
        'services/tags.js',
        'services/validators.js',
        'services/website.js',
        'collections/activities.js',
        'collections/invites.js',
        'collections/contributions.js',
        'collections/updates.js',
        'collections/notifications.js',
        'collections/partups.js',
        'collections/images.js',
        'collections/ratings.js',
        'collections/networks.js',
        'collections/users.js',
        'collections/tags.js',
        'collections/places.js',
        'collections/places_autocompletes.js',
        'collections/languages.js',
        'collections/tiles.js',
        'collections/swarms.js',
        'schemas/activity.js',
        'schemas/update.js',
        'schemas/contribution.js',
        'schemas/forgotPassword.js',
        'schemas/login.js',
        'schemas/network.js',
        'schemas/partup.js',
        'schemas/register.js',
        'schemas/resetPassword.js',
        'schemas/settings.js',
        'schemas/tag.js',
        'schemas/inviteUpper.js',
        'schemas/rating.js',
        'schemas/networkBulkinvite.js',
        'schemas/language.js',
        'schemas/tile.js',
        'schemas/swarm.js',
        'transformers/activity.js',
        'transformers/partup.js',
        'transformers/user.js',
        'transformers/update.js',
        'transformers/contributions.js',
        'transformers/network.js',
        'transformers/swarm.js',
        'helpers/parselocale.js',
        'helpers/mentions.js',
        'helpers/normalize.js',
        'helpers/interpolateEmailMessage.js',
        'helpers/url.js',
        'helpers/fileUploader.js',
        'helpers/dropboxChooser.js',
        'helpers/filestackUploader.js'
    ]);

    api.addFiles([
        'startup/default_profile_pictures.js',
        'startup/default_partup_pictures.js'
    ], ['server']);

    for (var i = 1; i <= 15; i++) {
        api.addFiles('private/default_profile_pictures/Profielfoto' + i + '.png', 'server', {isAsset: true});
    }

    for (var i = 1; i <= 12; i++) {
        api.addFiles('private/default_partup_pictures/Partupfoto' + i + '.png', 'server', {isAsset: true});
    }

    // Version
    api.export('Version');

    // Namespace
    api.export('Partup');

    // Collections
    api.export('Activities');
    api.export('Invites');
    api.export('Contributions');
    api.export('Images');
    api.export('Temp');
    api.export('Networks');
    api.export('Notifications');
    api.export('Partups');
    api.export('Ratings');
    api.export('Tags');
    api.export('Updates');
    api.export('Update');
    api.export('User');
    api.export('Places');
    api.export('PlacesAutocompletes');
    api.export('Uploads');
    api.export('Languages');
    api.export('Tiles');
    api.export('Swarms');

    // Globals
    api.export('get');
    api.export('set');
});
