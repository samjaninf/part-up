Template.DropdownChatNotifications.onCreated(function() {
    var template = this;
    template.dropdownOpen = new ReactiveVar(false, function(a, b) {
        if (a === b || b) return;
        var messages = ChatMessages.find({seen_by: {$nin: [Meteor.userId()]}}).fetch();
        messages.forEach(function(message) {
            Meteor.call('chatmessages.seen', message._id);
        });
    });
    template.subscribe('chats.for_loggedin_user', {networks: true}, {});
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
    }
});

Template.DropdownChatNotifications.helpers({
    menuOpen: function() {
        return Template.instance().dropdownOpen.get();
    },
    reactiveDropdownOpen: function() {
        return Template.instance().dropdownOpen;
    },
    data: function() {
        var userId = Meteor.userId();
        var chats = Chats.find({}, {fields: {_id: 1, counter: 1}, sort: {updated_at: -1}})
            .fetch()
            .map(function(chat) {
                var message = ChatMessages.findOne({chat_id: chat._id});
                if (message) {
                    chat.hasMessages = true;
                    chat.messagesHaveBeenSeen = message.isSeenByUpper(userId);
                    chat.messagesHaveBeenRead = !chat.hasUnreadMessages();
                }
                return chat;
            })
            .filter(function(chat) {
                return !!chat.hasMessages;
            });

        return {
            chats: function() {
                return chats;
            },
            allMessagesAreSeen: function() {
                var seen = true;
                chats.forEach(function(chat) {
                    if (!chat.messagesHaveBeenSeen) seen = false;
                });
                return seen;
            }
        };
    }
});
