Meteor.publishComposite('chats.for_loggedin_user', function(parameters, options) {
    this.unblock();

    parameters = parameters || {};
    options = options || {};
    check(parameters, {
        private: Match.Optional(Boolean),
        networks: Match.Optional(Boolean)
    });
    check(options, {
        limit: Match.Optional(Number),
        skip: Match.Optional(Number)
    });

    return {
        find: function() {
            return Meteor.users.find(this.userId, {fields: {chats: 1}});
        },
        children: [{
            find: function(user) {
                return Chats.findForUser(user._id, parameters, options);
            },
            children: [{
                    find: function(chat) {
                        return Meteor.users.findMultiplePublicProfiles([], {}, {hackyReplaceSelectorWithChatId: chat._id});
                    },
                    children: [
                        {find: Images.findForUser}
                    ]
                },{
                    find: function(chat) {
                        return ChatMessages.find({chat_id: chat._id}, {sort: {created_at: -1}, limit: 1});
                    }
                },{
                    find: function(chat) {
                        return Networks.find({chat_id: chat._id}, {fields: {name: 1, slug: 1, chat_id: 1, image: 1, admins: 1}, limit: 1});
                    },
                    children: [
                        {find: Images.findForNetwork}
                    ]
                }
            ]}
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
                    if (user.chats.indexOf(chatId) === -1) return;
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
