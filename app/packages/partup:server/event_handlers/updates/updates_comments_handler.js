var d = Debug('event_handlers:updates_comments_handler');

/**
 * Generate a Notification for the upper for the first comment posted on a message/update
 */
Event.on('updates.comments.inserted', function(upper, partup, update, comment) {
    update = new Update(update);
    var commenterId = upper._id;
    var notifiedUppers = [];

    // Parse message for user mentions
    var limitExceeded = Partup.helpers.mentions.exceedsLimit(comment.content);
    var mentions = Partup.helpers.mentions.extract(comment.content);
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

            notifiedUppers.push(user._id);

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
                // Retrieve the user from the database (ensures that the user does indeed exists!)
                if (mention._id === commenterId) return;
                var user = Meteor.users.findOne(mention._id);
                process(user);
            } else if (mention.type === 'group') {
                // Retrieve each user from the database (ensures that the user does indeed exists!)
                mention.users.forEach(function(userId) {
                    if (userId === commenterId) return;
                    var user = Meteor.users.findOne(userId);
                    process(user);
                });
            }
        });
    }

    /* -------------------------------------------------- */

    // Add the comment to new comment list for the targeted users
    var upperIds = partup.getUsers();
    update.addNewCommentToUpperData(comment, upperIds);

    /* -------------------------------------------------- */

    // Check if a new comment notification needs to be created
    if (comment.type === 'motivation') return; // Nope

    // Collect all uppers that should receive a new comment notification
    var involvedUppers = update.getInvolvedUppers();

    // Filter the creator of the comment and the already mentioned uppers
    var filteredUppers = involvedUppers.filter(function(upperId) {
        return (upperId !== commenterId && notifiedUppers.indexOf(upperId) < 0);
    });

    var notificationType = 'partups_new_comment_in_involved_conversation';

    Meteor.users.find({_id: {$in: filteredUppers}}).fetch().forEach(function(notifiedUpper) {
        if (!User(notifiedUpper).isActive()) return; // Ignore deactivated accounts

        var notificationOptions = {
            userId: notifiedUpper._id,
            type: notificationType,
            typeData: {
                commenter: {
                    _id: comment.creator._id,
                    name: comment.creator.name,
                    image: comment.creator.image
                },
                partup: {
                    _id: partup._id,
                    name: partup.name,
                    slug: partup.slug
                },
                update: {
                    _id: update._id
                }
            }
        };

        // Send the notification
        Partup.server.services.notifications.send(notificationOptions);

        // Set the email details
        var emailOptions = {
            type: notificationType,
            toAddress: User(notifiedUpper).getEmail(),
            subject: TAPi18n.__('emails-' + notificationType + '-subject', {}, User(notifiedUpper).getLocale()),
            locale: User(notifiedUpper).getLocale(),
            typeData: {
                name: User(notifiedUpper).getFirstname(),
                upperName: comment.creator.name,
                partupName: partup.name,
                url: Meteor.absoluteUrl() + 'partups/' + partup.slug + '/updates/' + update._id,
                unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/' + notificationType + '/' + notifiedUpper.profile.settings.unsubscribe_email_token,
                unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + notifiedUpper.profile.settings.unsubscribe_email_token
            },
            userEmailPreferences: notifiedUpper.profile.settings.email
        };

        // Send the email
        Partup.server.services.emails.send(emailOptions);
    });
});
