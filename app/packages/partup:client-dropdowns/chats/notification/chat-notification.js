Template.ChatNotification.onCreated(function() {

});
Template.ChatNotification.helpers({
    notificationName: function() {
        return 'notification_' + this.notification.type;
    },
    data: function() {
        var template = Template.instance();
        var message = template.data.message;
        var chatId = message.chat_id;
        return {
            message: function() {
                return message;
            },
            chat_id: function() {
                return chatId;
            },
            network: function() {
                return Networks.findOne({chat_id: chatId});
            },
            creator: function() {
                return Meteor.users.findOne({_id: message.creator_id});
            },
            notificationCount: function() {
                return Chats.findOne({_id: chatId}).getUnreadCountForUser(Meteor.userId());
            }
        };
    }
});
