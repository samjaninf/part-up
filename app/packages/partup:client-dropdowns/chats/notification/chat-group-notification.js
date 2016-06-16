Template.ChatGroupNotification.helpers({
    notificationName: function() {
        return 'notification_' + this.notification.type;
    },
    created_at: function() {
        var template = Template.instance();
        var chat = template.data.chat;
        var chatId = chat._id;
        var message = ChatMessages.findOne({chat_id: chatId}, {sort: {created_at: -1}, limit: 1});
        return message.created_at;
    },
    data: function() {
        var template = Template.instance();
        var chat = template.data.chat;
        var chatId = chat._id;
        var message = ChatMessages.findOne({chat_id: chatId}, {sort: {created_at: -1}, limit: 1});
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
