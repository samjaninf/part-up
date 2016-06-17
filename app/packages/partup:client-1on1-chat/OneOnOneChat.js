Template.OneOnOneChat.onCreated(function() {
    var template = this;
    var chatId = template.data.chatId || undefined;
    template.initialized = new ReactiveVar(false);
    template.activeChat = new ReactiveVar(undefined);
    template.chatPerson = new ReactiveVar(undefined);

    template.subscribe('chats.for_loggedin_user', {private: true}, {}, {
        onReady: function() {
            template.initialized.set(true);
        }
    });

    template.startNewChat = function(userId) {
        Meteor.call('chats.start_with_users', [userId], function(err, chat_id) {
            if (err) return Partup.client.notify.error('nope');
            template.initializeChat(chat_id, Meteor.users.findOne(userId));
        });
    };

    var currentChatId = undefined;
    template.activeChatSubscription = undefined;
    template.activeChatSubscriptionReady = new ReactiveVar(false);
    template.initializeChat = function(chatId, person) {
        template.activeChat.set(chatId);
        template.activeChatSubscriptionReady.set(false);
        template.activeChatSubscription = template.subscribe('chats.by_id', chatId, {limit: 50}, {
            onReady: function() {
                if (person) {
                    template.chatPerson.set(person);
                } else {
                    template.chatPerson.set(Meteor.users.findOne({_id: {$nin: [Meteor.userId()]}, chats: {$in: [chatId]}}));
                }
                startMessageCollector(chatId);
                template.activeChatSubscriptionReady.set(true);
            }
        });
    };

    var localChatMessagesCollection = [];
    template.reactiveMessages = new ReactiveVar([]);
    var startMessageCollector = function(chat_id) {
        // reset
        currentChatId = chat_id;
        localChatMessagesCollection = [];

        // gets chatmessages and stores them in localChatMessagesCollection
        template.autorun(function(computation) {
            if (chat_id !== currentChatId) return computation.stop();
            // var limit = template.messageLimit.get();
            var messages = ChatMessages
                .find({chat_id: chat_id}, {limit: 50, sort: {created_at: 1}})
                .fetch();

            // store messages locally and filter out duplicates
            localChatMessagesCollection = localChatMessagesCollection.concat(messages);
            localChatMessagesCollection = mout.array.unique(localChatMessagesCollection, function(message1, message2) {
                return message1._id === message2._id;
            });

            // wrapped in nonreactive to prevent unnecessary autorun
            Tracker.nonreactive(function() {
                template.reactiveMessages.set(localChatMessagesCollection);
            });
        });
    };
    if (chatId) {
        template.initializeChat(chatId);
    }
    template.autorun(function() {
        var controller = Iron.controller();
        var hash = controller.getParams().hash;
        template.initializeChat(hash);
    });
});

Template.OneOnOneChat.helpers({
    data: function() {
        var template = Template.instance();
        return {
            activeChat: function() {
                return template.activeChatSubscriptionReady.get();
            }
        };
    },
    state: function() {
        var template = Template.instance();
        return {
            initialized: function() {
                return template.initialized.get();
            },
            selectedChat: function() {
                return template.activeChat.get();
            }
        };
    },
    config: function() {
        var template = Template.instance();
        var chatId = template.activeChat.get();
        var chatPerson = template.chatPerson.get();
        return {
            sideBar: function() {
                return {
                    onStartChat: template.startNewChat,
                    onInitializeChat: template.initializeChat,
                    reactiveActiveChat: template.activeChat
                };
            },
            bottomBar: function() {
                return {
                    reactiveChatId: template.activeChat
                };
            },
            messageView: function() {
                return {
                    chatId: chatId,
                    onScrollTop: lodash.noop,
                    onNewMessagesViewed: lodash.noop,
                    reactiveMessages: template.reactiveMessages,
                    reactiveHighlight:  new ReactiveVar(''),
                    placeholderText: TAPi18n.__('pages-one-on-one-chat-empty-placeholder', {
                        person: chatPerson.profile.name
                    })
                };
            }
        };
    }
});
