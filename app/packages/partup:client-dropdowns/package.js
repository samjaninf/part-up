Package.describe({
    name: 'partup:client-dropdowns',
    version: '0.0.1',
    summary: '',
    documentation: null
});

Package.onUse(function(api) {
    api.use([
        'meteorhacks:subs-manager'
    ], ['client', 'server']);

    api.use([
        'templating',
        'partup:lib',
        'reactive-var'
    ], 'client');

    api.addFiles([

        'dropdowns.js',

        'notifications/notifications.html',
        'notifications/notifications.js',
        'notifications/notification/notification.html',
        'notifications/notification/notification.js',

        'notifications/notification/types/network/accepted.html',
        'notifications/notification/types/network/invite.html',
        'notifications/notification/types/network/member-left.html',
        'notifications/notification/types/network/new-member.html',
        'notifications/notification/types/network/new-pending-upper.html',
        'notifications/notification/types/network/partup-created.html',

        'notifications/notification/types/partup/activities-invited.html',
        'notifications/notification/types/partup/contribution-accepted.html',
        'notifications/notification/types/partup/contribution-rating.html',
        'notifications/notification/types/partup/contribution-rejected.html',
        'notifications/notification/types/partup/multiple-new-comment-conversation.html',
        'notifications/notification/types/partup/multiple-new-updates.html',
        'notifications/notification/types/partup/multiple-new-uppers.html',
        'notifications/notification/types/partup/new-activity.html',
        'notifications/notification/types/partup/new-comment-conversation.html',
        'notifications/notification/types/partup/new-contribution-proposed.html',
        'notifications/notification/types/partup/new-contribution.html',
        'notifications/notification/types/partup/new-message.html',
        'notifications/notification/types/partup/reminder-ratings.html',
        'notifications/notification/types/partup/supporters-added.html',
        'notifications/notification/types/partup/update-comment.html',
        'notifications/notification/types/partup/upper-invite.html',
        'notifications/notification/types/partup/user-mention.html',
        'notifications/notification/types/partup/archived.html',
        'notifications/notification/types/partup/unarchived.html',

        'chats/chat-notifications.html',
        'chats/chat-notifications.js',
        'chats/notification/chat-notification.html',
        'chats/notification/chat-notification.js',

        'menu/menu.html',
        'menu/menu.js',

        'profile/profile.html',
        'profile/profile.js',

        'partials/partup/updates-actions.html',
        'partials/partup/updates-actions.js',
        'partials/partup/activities-actions.html',
        'partials/partup/activities-actions.js',

        'partials/network/network-actions.html',
        'partials/network/network-actions.js',

        'partials/profile/upper-actions.html',
        'partials/profile/upper-actions.js',
        'partials/profile/supporter-actions.html',
        'partials/profile/supporter-actions.js'
    ], 'client');

});
