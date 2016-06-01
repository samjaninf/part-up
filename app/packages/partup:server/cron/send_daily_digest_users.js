if(process.env.PARTUP_CRON_ENABLED) {
    SyncedCron.add({
        name: 'Send daily notification email digest',
        schedule: function(parser) {
            return parser.text(Partup.constants.CRON_DIGEST);
        },
        job: function() {
            var counter = 0;
            Meteor.users.find({
                'flags.dailyDigestEmailHasBeenSent': false,
                'profile.settings.email.dailydigest': true
            }).forEach(function(user) {
                if (!User(user).isActive()) return; // Ignore deactivated accounts

                // This cronjob fails if a mail address doesn't exist. So check on this first.
                if (!User(user).getEmail()) {
                    Log.debug('DailyDigest job: no email found for user ' + user._id);
                    return;
                }

                var newNotifications = Notifications.findForUser(user, {'new': true}).fetch();
                if (newNotifications.length > 0) {

                    // Set the email details
                    var emailOptions = {
                        type: 'dailydigest',
                        toAddress: User(user).getEmail(),
                        subject: TAPi18n.__('emails-dailydigest-subject', {}, User(user).getLocale()),
                        locale: User(user).getLocale(),
                        typeData: {
                            name: User(user).getFirstname(),
                            notificationCount: newNotifications.length,
                            url: Meteor.absoluteUrl(),
                            unsubscribeOneUrl: Meteor.absoluteUrl() + 'unsubscribe-email-one/dailydigest/' + user.profile.settings.unsubscribe_email_token,
                            unsubscribeAllUrl: Meteor.absoluteUrl() + 'unsubscribe-email-all/' + user.profile.settings.unsubscribe_email_token
                        },
                        userEmailPreferences: user.profile.settings.email
                    };

                    // Send the email
                    Partup.server.services.emails.send(emailOptions);

                    Meteor.users.update(user._id, {'$set': {'flags.dailyDigestEmailHasBeenSent': true}});
                    counter++;
                }
            });
            console.log(counter + ' users were mailed with notification digest');
        }
    });
}
