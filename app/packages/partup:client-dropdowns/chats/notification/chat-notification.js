Template.ChatNotification.onCreated(function() {

});
Template.ChatNotification.helpers({
    notificationName: function() {
        return 'notification_' + this.notification.type;
    },
    data: function() {
        var template = Template.instance();
        return {
            latestMessage: function() {
                return template.data.messages[0];
            },
            network: function() {
                return Networks.findOne({chat_id: template.data.chat_id});
            },
            creator: function() {
                return Meteor.users.findOne({_id: template.data.messages[0].creator_id});
            },
            notificationCount: function() {
                return Chats.findOne({_id: template.data.chat_id}).getUnreadCountForUser(Meteor.userId());
            }
        };
    }
});
