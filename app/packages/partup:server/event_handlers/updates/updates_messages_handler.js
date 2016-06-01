var d = Debug('event_handlers:updates_messages_handler');

/**
 * Notify mentioned uppers
 */
Event.on('partups.messages.insert', function(upper, partup, update, message) {
    var messagerId = upper._id;
    // Parse message for user mentions
    var limitExceeded = Partup.helpers.mentions.exceedsLimit(message);
    var mentions = Partup.helpers.mentions.extract(message);
    var process = function(user) {
        if (!User(user).isActive()) return; // Ignore deactivated accounts

        if (partup.isViewableByUser(user._id)) {
            // Set the notification details
            var notificationOptions = {
                userId: user._id,
                type: 'partups_user_mentioned',
                typeData: {
                    mentioning_upper: {
                        _id: upper._id,
                        name: upper.profile.name,
                        image: upper.profile.image
                    },
                    update: {
                        _id: update._id
                    },
                    partup: {
                        _id: partup._id,
                        name: partup.name,
                        slug: partup.slug
                    }
                }
            };

            // Send the notification
            Partup.server.services.notifications.send(notificationOptions);

            // Set the email details
            var emailOptions = {
                type: 'upper_mentioned_in_partup',
                toAddress: User(user).getEmail(),
                subject: TAPi18n.__('emails-upper_mentioned_in_partup-subject', {partup: partup.name}, User(user).getLocale()),
                locale: User(user).getLocale(),
                typeData: {
                    name: User(user).getFirstname(),
                    mentioningUpper: upper.profile.name,
                    partupName: partup.name,
                    url: Meteor.absoluteUrl() + 'partups/' + partup.slug + '/updates/' + update._id,
                    unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/upper_mentioned_in_partup/' + user.profile.settings.unsubscribe_email_token,
                    unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + user.profile.settings.unsubscribe_email_token
                },
                userEmailPreferences: user.profile.settings.email
            };

            // Send the email
            Partup.server.services.emails.send(emailOptions);
        }
    };
    if (!limitExceeded) {
        mentions.forEach(function(mention) {
            if (mention.type === 'single') {
                // make sure the mentioned user is not the same as the creator
                if (messagerId === mention._id) return;
                // Retrieve the user from the database (ensures that the user does indeed exists!)
                var user = Meteor.users.findOne(mention._id);
                process(user);
            } else if (mention.type === 'group') {
                // Retrieve each user from the database (ensures that the user does indeed exists!)
                mention.users.forEach(function(userId) {
                    // make sure the mentioned user is not the same as the creator
                    if (messagerId === userId) return;
                    var user = Meteor.users.findOne(userId);
                    process(user);
                });
            }
        });
    }
});
