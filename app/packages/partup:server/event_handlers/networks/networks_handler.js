/**
 * Generate a notification for an upper when getting accepted for a network
 */
Event.on('networks.accepted', function(userId, networkId, upperId) {
    var network = Networks.findOneOrFail(networkId);
    var acceptedUpper = Meteor.users.findOneOrFail(upperId);
    if (!User(acceptedUpper).isActive()) return; // Ignore deactivated accounts
    var notificationType = 'partups_networks_accepted';

    // Send notifications to accepted upper
    var notificationOptions = {
        userId: acceptedUpper._id,
        type: notificationType,
        typeData: {
            network: {
                _id: network._id,
                name: network.name,
                image: network.image,
                slug: network.slug
            }
        }
    };

    Partup.server.services.notifications.send(notificationOptions);

    // Set the email details
    var emailOptions = {
        type: notificationType,
        toAddress: User(acceptedUpper).getEmail(),
        subject: TAPi18n.__('emails-partups_networks_accepted-subject', {network: network.name}, User(acceptedUpper).getLocale()),
        locale: User(acceptedUpper).getLocale(),
        typeData: {
            name: User(acceptedUpper).getFirstname(),
            networkName: network.name,
            url: Meteor.absoluteUrl() + 'tribes/' + network.slug,
            unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/' + notificationType + '/' + acceptedUpper.profile.settings.unsubscribe_email_token,
            unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + acceptedUpper.profile.settings.unsubscribe_email_token
        },
        userEmailPreferences: acceptedUpper.profile.settings.email
    };

    // Send the email
    Partup.server.services.emails.send(emailOptions);
});

/**
 * Generate a notification for the network admins when a new upper is pending
 */
Event.on('networks.new_pending_upper', function(network, pendingUpper) {
    var notificationType = 'partups_networks_new_pending_upper';
    var admins = Meteor.users.find({_id: {$in: network.admins}});

    admins.forEach(function(admin) {
        // Send notifications to network admin
        var notificationOptions = {
            userId: admin._id,
            type: notificationType,
            typeData: {
                pending_upper: {
                    _id: pendingUpper._id,
                    name: pendingUpper.profile.name,
                    image: pendingUpper.profile.image
                },
                network: {
                    _id: network._id,
                    name: network.name,
                    image: network.image,
                    slug: network.slug
                }
            }
        };

        Partup.server.services.notifications.send(notificationOptions);

        // Set the email details
        var emailOptions = {
            type: notificationType,
            toAddress: User(admin).getEmail(),
            subject: TAPi18n.__('emails-partups_networks_new_pending_upper-subject', {
                upper: pendingUpper.profile.name,
                network: network.name
            }, User(admin).getLocale()),
            locale: User(admin).getLocale(),
            typeData: {
                name: User(admin).getFirstname(),
                pendingUpperName: pendingUpper.profile.name,
                networkName: network.name,
                url: Meteor.absoluteUrl() + 'tribes/' + network.slug + '/settings/requests',
                unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/' + notificationType + '/' + admin.profile.settings.unsubscribe_email_token,
                unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + admin.profile.settings.unsubscribe_email_token
            },
            userEmailPreferences: admin.profile.settings.email
        };

        // Send the email
        Partup.server.services.emails.send(emailOptions);
    });
});

/**
 * Generate a notification for the network uppers to notify the new upper
 */
Event.on('networks.uppers.inserted', function(newUpper, network) {
    var notificationType = 'partups_networks_new_upper';

    // Send notifications to all uppers in network
    var networkUppers = network.uppers || [];
    Meteor.users.find({_id: {$in: networkUppers}}).forEach(function(networkUpper) {
        if (!User(networkUpper).isActive()) return; // Ignore deactivated accounts
        // Don't notify the upper that just joined
        if (networkUpper._id === newUpper._id) return;

        // Set-up notification options
        var notificationOptions = {
            userId: networkUpper._id,
            type: notificationType,
            typeData: {
                upper: {
                    _id: newUpper._id,
                    name: newUpper.profile.name,
                    image: newUpper.profile.image
                },
                network: {
                    _id: network._id,
                    name: network.name,
                    image: network.image,
                    slug: network.slug
                }
            }
        };

        Partup.server.services.notifications.send(notificationOptions);

        // Set the email details
        var emailOptions = {
            type: notificationType,
            toAddress: User(networkUpper).getEmail(),
            subject: TAPi18n.__('emails-' + notificationType + '-subject', {network: network.name}, User(networkUpper).getLocale()),
            locale: User(networkUpper).getLocale(),
            typeData: {
                name: User(networkUpper).getFirstname(),
                upperName: newUpper.profile.name,
                networkName: network.name,
                url: Meteor.absoluteUrl() + 'tribes/' + network.slug + '/uppers',
                unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/' + notificationType + '/' + networkUpper.profile.settings.unsubscribe_email_token,
                unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + networkUpper.profile.settings.unsubscribe_email_token
            },
            userEmailPreferences: networkUpper.profile.settings.email
        };

        // Send the email
        Partup.server.services.emails.send(emailOptions);
    });
});

/**
 * Generate a notification for all network admins to notify that an upper left
 */
Event.on('networks.uppers.removed', function(upper, network) {
    var notificationType = 'partups_networks_upper_left';

    var admins = Meteor.users.find({_id: {$in: network.admins || []}});

    admins.forEach(function(networkAdmin) {
        var notificationOptions = {
            userId: networkAdmin._id,
            type: notificationType,
            typeData: {
                upper: {
                    _id: upper._id,
                    name: upper.profile.name,
                    image: upper.profile.image
                },
                network: {
                    _id: network._id,
                    name: network.name,
                    image: network.image,
                    slug: network.slug
                }
            }
        };

        Partup.server.services.notifications.send(notificationOptions);

        // Set the email details
        var emailOptions = {
            type: notificationType,
            toAddress: User(networkAdmin).getEmail(),
            subject: TAPi18n.__('emails-' + notificationType + '-subject', {network: network.name}, User(networkAdmin).getLocale()),
            locale: User(networkAdmin).getLocale(),
            typeData: {
                name: User(networkAdmin).getFirstname(),
                upperName: upper.profile.name,
                networkName: network.name,
                url: Meteor.absoluteUrl() + 'tribes/' + network.slug + '/uppers',
                unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/' + notificationType + '/' + networkAdmin.profile.settings.unsubscribe_email_token,
                unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + networkAdmin.profile.settings.unsubscribe_email_token
            },
            userEmailPreferences: networkAdmin.profile.settings.email
        };

        // Send the email
        Partup.server.services.emails.send(emailOptions);
    });
});
