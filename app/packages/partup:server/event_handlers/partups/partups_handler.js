Event.on('partups.inserted', function(userId, partup) {
    if (!userId) return;

    // Store new tags into collection
    Partup.services.tags.insertNewTags(partup.tags);

    // Add language to collection if new
    Partup.server.services.language.addNewLanguage(partup.language);

    // "User created this part-up" update
    var update_created = Partup.factories.updatesFactory.make(userId, partup._id, 'partups_created', {});
    Updates.insert(update_created);

    // "System message" update
    var update_systemmessage = Partup.factories.updatesFactory.makeSystem(partup._id, 'partups_message_added', {
        type: 'welcome_message'
    });
    Updates.insert(update_systemmessage);

    // If the Partup has been created in a Network, notify all its users
    if (partup.network_id) {
        var network = Networks.findOneOrFail(partup.network_id);
        var creator = Meteor.users.findOneOrFail(userId);

        network.uppers.forEach(function(upperId) {
            // Dont send a notification to the creator of the partup
            if (upperId === creator._id) return;

            var upper = Meteor.users.findOneOrFail(upperId);

            if (!User(upper).isActive()) return; // Ignore deactivated accounts

            // Set the notification details
            var notificationOptions = {
                userId: upper._id,
                type: 'partup_created_in_network',
                typeData: {
                    creator: {
                        _id: creator._id,
                        name: creator.profile.name,
                        image: creator.profile.image
                    },
                    network: {
                        name: network.name
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
                type: 'partup_created_in_network',
                toAddress: User(upper).getEmail(),
                subject: TAPi18n.__('emails-partup_created_in_network-subject', {network: network.name}, User(upper).getLocale()),
                locale: User(upper).getLocale(),
                typeData: {
                    name: User(upper).getFirstname(),
                    creatorName: creator.profile.name,
                    partupName: partup.name,
                    networkName: network.name,
                    url: Meteor.absoluteUrl() + 'partups/' + partup.slug,
                    unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/partup_created_in_network/' + upper.profile.settings.unsubscribe_email_token,
                    unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + upper.profile.settings.unsubscribe_email_token
                },
                userEmailPreferences: upper.profile.settings.email
            };

            // Send the email
            Partup.server.services.emails.send(emailOptions);
        });
    }
});

Event.on('partups.updated', function(userId, partup, fields) {
    // Store new tags into collection
    Partup.services.tags.insertNewTags(partup.tags);

    // Add language to collection if new
    Partup.server.services.language.addNewLanguage(partup.language);
});

Event.on('partups.archived', function(userId, partup) {
    // "User archived this part-up" update
    var update_archived = Partup.factories.updatesFactory.make(userId, partup._id, 'partups_archived', {});
    Updates.insert(update_archived);

    var archiver = Meteor.users.findOneOrFail(userId);

    var notify_uppers = partup.uppers || [];
    var partup_supporters = partup.supporters || [];
    notify_uppers.push.apply(notify_uppers, partup_supporters);

    notify_uppers.forEach(function(upperId) {
        // Dont send a notification to the archiver of the partup
        if (upperId === userId) return;

        var upper = Meteor.users.findOneOrFail(upperId);

        // Set the notification details
        var notificationOptions = {
            userId: upper._id,
            type: 'partups_archived',
            typeData: {
                archiver: {
                    _id: archiver._id,
                    name: archiver.profile.name,
                    image: archiver.profile.image
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
    });
});

Event.on('partups.unarchived', function(userId, partup) {
    // "User unarchived this part-up" update
    var update_unarchived = Partup.factories.updatesFactory.make(userId, partup._id, 'partups_unarchived', {});
    Updates.insert(update_unarchived);

    var unarchiver = Meteor.users.findOneOrFail(userId);

    var notify_uppers = partup.uppers || [];
    var partup_supporters = partup.supporters || [];
    notify_uppers.push.apply(notify_uppers, partup_supporters);

    notify_uppers.forEach(function(upperId) {
        // Dont send a notification to the unarchiver of the partup
        if (upperId === userId) return;

        var upper = Meteor.users.findOneOrFail(upperId);

        // Set the notification details
        var notificationOptions = {
            userId: upper._id,
            type: 'partups_unarchived',
            typeData: {
                unarchiver: {
                    _id: unarchiver._id,
                    name: unarchiver.profile.name,
                    image: unarchiver.profile.image
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
    });
});
