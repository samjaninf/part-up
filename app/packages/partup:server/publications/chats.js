Meteor.publishComposite('chats.for_loggedin_user', function(options) {
    this.unblock();

    options = options || {};
    check(options, {
        limit: Match.Optional(Number),
        skip: Match.Optional(Number)
    });

    return {
        find: function() {
            return Meteor.users.find(this.userId, {fields: {chats: 1}});
        },
        children: [
            {
                find: function(user) {
                    return Chats.findForUser(user._id, options);
                },
                children: [
                    {
                        find: function(chat) {
                            return Meteor.users.findMultiplePublicProfiles([], {}, {hackyReplaceSelectorWithChatId: chat._id});
                        },
                        children: [
                            {find: Images.findForUser}
                        ]
                    },
                    {find: function(chat) {
                        return ChatMessages.find({chat_id: chat._id}, {sort: {created_at: -1}, limit: 1});
                    }}
                ]
            }
        ]
    };
});

Meteor.publishComposite('chats.by_id', function(chatId, chatMessagesOptions) {
    this.unblock();
    check(chatId, String);
    chatMessagesOptions = chatMessagesOptions || {};
    check(chatMessagesOptions, {
        limit: Match.Optional(Number),
        skip: Match.Optional(Number)
    });

    return {
        find: function() {
            return Meteor.users.find({_id: this.userId});
        },
        children: [
            {
                find: function(user) {
                    if (user.chats && user.chats.indexOf(chatId) === -1) return;
                    return Chats.findForUser(this.userId);
                },
                children: [
                    {
                        find: function(chat) {
                            return Meteor.users.findMultiplePublicProfiles([], {}, {hackyReplaceSelectorWithChatId: chat._id});
                        },
                        children: [
                            {find: Images.findForUser}
                        ]
                    },
                    {
                        find: function(chat) {
                            chatMessagesOptions.sort = {created_at: -1};
                            return ChatMessages.find({chat_id: chat._id}, chatMessagesOptions);
                        }
                    }
                ]
            }
        ]
    };
});
