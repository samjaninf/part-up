'use strict';

var apn = Npm.require('apn'); // Apple Push Notification

var sendApnNotification;
var sendGcmNotification;

Meteor.startup(function() {

    /**
     * Apple Push Notification
     */
    if (process.env.PUSH_APPLE_APN_PFX) {
        var apnConnection = new apn.Connection({
            pfx: new Buffer(process.env.PUSH_APPLE_APN_PFX, 'base64'),
        });

        sendApnNotification = function(device, user, message, payload, badge) {
            var apnDevice = new apn.Device(device.registration_id);
            var note = new apn.Notification();

            note.badge = badge;
            note.alert = message;
            note.payload = {
                payload: JSON.stringify(payload)
            };

            apnConnection.pushNotification(note, apnDevice);
        };
    }

    /**
     * Google Cloud Messaging
     */
    if (process.env.PUSH_GOOGLE_GCM_API) {
        sendGcmNotification = function(device, user, message, payload, collapseKey) {
            HTTP.call('POST', 'https://android.googleapis.com/gcm/send', {
                headers: {
                    'Authorization': 'key=' + process.env.PUSH_GOOGLE_GCM_API,
                    'Content-Type': 'application/json'
                },
                data: {
                    registration_ids: [device.registration_id],
                    data: mout.object.mixIn({}, {
                        title: 'Part-up',
                        body: message,
                        payload: JSON.stringify(payload)
                    })
                }
            });
        };
    }
});

/**
 @namespace Partup server app notifications service
 @name Partup.server.services.pushnotifications
 @memberof Partup.server.services
 */
Partup.server.services.pushnotifications = {

    /**
     * Send app notifications to all mobile phones of a set of users
     *
     * @param userIds {Array} - users you want to deliver the notification to
     * @param filterDevices {Function} - optional filter function for devices (first arg is `device`, second arg is `user`)
     * @param message {String} - message of the notification
     * @param payload {Object} - payload for the app to receive on notification tap
     * @param collapseKey {String} - collapse notifications with the same collapseKey
     */
    send: function(userIds, filterDevices, message, payload, collapseKey) {
        userIds.forEach(function(id) {
            var user = Meteor.users.findOne(id);
            check(user, Object);

            var devices = (user.push_notification_devices || [])
                .filter(function(device) {
                    if (!filterDevices) return true;
                    return filterDevices(device, user);
                });

            if (devices.length > 0) {

                var badge;
                devices.forEach(function(device) {
                    if (device.platform === 'iOS') {
                        if (typeof badge === 'undefined') {
                            badge = User(user).calculateApplicationIconBadgeNumber();
                        }

                        if (sendApnNotification) {
                            sendApnNotification(device, user, message, payload, badge);
                        }
                    } else if (device.platform === 'Android') {
                        if (sendGcmNotification) {
                            sendGcmNotification(device, user, message, payload, collapseKey);
                        }
                    }
                });
            }
        });
    }

};
