Template.DropdownChatNotifications.onCreated(function() {
    var template = this;
    template.private = new ReactiveVar(true);
    template.dropdownOpen = new ReactiveVar(false, function(a, b) {
        if (a === b || b) return;
        var messages = ChatMessages.find({seen_by: {$nin: [Meteor.userId()]}}).forEach(function(message) {
            Meteor.call('chatmessages.seen', message._id);
        });
    });
    template.subscribe('chats.for_loggedin_user', {networks: true, private: true}, {});
});
Template.DropdownChatNotifications.onRendered(function() {
    var template = this;
    ClientDropdowns.addOutsideDropdownClickHandler(template, '[data-clickoutside-close]', '[data-toggle-menu=chat-notifications]');
    Router.onBeforeAction(function(req, res, next) {
        template.dropdownOpen.set(false);
        next();
    });
});

Template.DropdownChatNotifications.onDestroyed(function() {
    var template = this;
    ClientDropdowns.removeOutsideDropdownClickHandler(template);
});

Template.DropdownChatNotifications.events({
    'DOMMouseScroll [data-preventscroll], mousewheel [data-preventscroll]': Partup.client.scroll.preventScrollPropagation,
    'click [data-toggle-menu]': ClientDropdowns.dropdownClickHandler,
    'click [data-notification]': function(event, template) {
        template.dropdownOpen.set(false);
    },
    'click [data-private]': function(event, template) {
        event.preventDefault();
        template.private.set(true);
    },
    'click [data-network]': function(event, template) {
        event.preventDefault();
        template.private.set(false);
    }
});

Template.DropdownChatNotifications.helpers({
    menuOpen: function() {
        return Template.instance().dropdownOpen.get();
    },
    reactiveDropdownOpen: function() {
        return Template.instance().dropdownOpen;
    },
    private: function() {
        return Template.instance().private.get();
    },
    data: function() {
        var template = Template.instance();
        var getPrivate = template.private.get();
        var userId = Meteor.userId();
        var user = Meteor.user();
        var chats = Chats.findForUser(userId, {networks: !getPrivate, private: getPrivate}, {fields: {_id: 1, counter: 1, created_at: 1}, sort: {updated_at: -1}})
            .map(function(chat) {
                if (getPrivate) {
                    chat.upper = Meteor.users
                        .findOne({_id: {$nin: [user._id]}, chats: {$in: [chat._id]}});
                }
                var message = ChatMessages.findOne({chat_id: chat._id}, {sort: {created_at: -1}, limit: 1});
                if (message) {
                    chat.hasMessages = true;
                    chat.messagesHaveBeenSeen = message.isSeenByUpper(userId);
                    chat.messagesHaveBeenRead = !chat.hasUnreadMessages();
                    chat.message = message;
                }
                return chat;
            })
            .filter(function(chat) {
                if (!getPrivate) {
                    return !!chat.hasMessages;
                } else {
                    return true;
                }
            });

        return {
            chats: function() {
                return chats;
            },
            allMessagesAreSeen: function() {
                var seen = true;
                chats.forEach(function(chat) {
                    if (!chat.messagesHaveBeenSeen && chat.message) seen = false;
                });
                return seen;
            }
        };
    }
});
