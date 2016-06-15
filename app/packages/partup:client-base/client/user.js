/**
 * Client user helpers
 *
 * @class user
 * @memberOf Partup.client
 */

Partup.client.user = {
    logout: function() {
        if (Intercom) Intercom('shutdown');
        Meteor.logout();
    }
};
