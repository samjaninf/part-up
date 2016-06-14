Template.registerHelper('chatTimeoutHasPassed', function(uniqueId, timeout) {
    var alreadyFired = Partup.client.chat._chat_timekeeper.get('chattimeout_' + uniqueId);
    if (!alreadyFired) {
        Meteor.setTimeout(function() {
            Partup.client.chat._chat_timekeeper.set('chattimeout_' + uniqueId, true);
        }, timeout);
    }
    return Partup.client.chat._chat_timekeeper.get('chattimeout_' + uniqueId);
});
