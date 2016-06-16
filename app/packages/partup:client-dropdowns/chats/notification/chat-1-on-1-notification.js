Template.ChatOneOnOneNotification.helpers({
    notificationName: function() {
        return 'notification_' + this.notification.type;
    },
    data: function() {
        var template = Template.instance();
        var chat = template.data.chat;
        var chatId = chat._id;
        var message = chat.message;
        return {
            message: function() {
                return message;
            },
            creator: function() {
                return Meteor.users.findOne(message.creator_id);
            },
            chat: function() {
                return chat;
            },
            network: function() {
                return Networks.findOne({chat_id: chatId});
            }
        };
    }
});
