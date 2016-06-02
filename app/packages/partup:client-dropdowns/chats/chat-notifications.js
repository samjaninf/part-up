Template.DropdownChatNotifications.onCreated(function() {
    var template = this;
    template.dropdownOpen = new ReactiveVar(false, function(a, b) {
        if (a === b || b) return;

        // Meteor.call('notifications.all_read');
    });

    //Update the number of notifications in the title
    // template.autorun(function() {
    //     var numberOfNotifications = Notifications.findForUser(Meteor.user(), {'new': true}).count();
    //     if (numberOfNotifications > 0) {
    //         document.title = '(' + numberOfNotifications + ')' + ' Part-up';
    //     } else {
    //         document.title = 'Part-up';
    //     }
    // });
    template.limit = new ReactiveVar(10);
    template.subscribe('chats.for_loggedin_user', {networks: true}, {});
    template.resetLimit = function() {
        Meteor.setTimeout(function() {
            template.limit.set(10);
            $(template.find('[data-clickoutside-close] ul')).scrollTop(0);
        }, 200);
    };
});
Template.DropdownChatNotifications.onRendered(function() {
    var template = this;
    ClientDropdowns.addOutsideDropdownClickHandler(template, '[data-clickoutside-close]', '[data-toggle-menu=chat-notifications]');
    Router.onBeforeAction(function(req, res, next) {
        template.dropdownOpen.set(false);
        next();
    });
    Partup.client.elements.onClickOutside([template.find('[data-clickoutside-close]')], template.resetLimit);
});

Template.DropdownChatNotifications.onDestroyed(function() {
    var template = this;
    ClientDropdowns.removeOutsideDropdownClickHandler(template);
    Partup.client.elements.offClickOutside(template.resetLimit);
});

Template.DropdownChatNotifications.events({
    'DOMMouseScroll [data-preventscroll], mousewheel [data-preventscroll]': Partup.client.scroll.preventScrollPropagation,
    'click [data-toggle-menu]': ClientDropdowns.dropdownClickHandler,
    'click [data-notification]': function(event, template) {
        template.dropdownOpen.set(false);
        var notificationId = $(event.currentTarget).data('notification');
        // Meteor.call('notifications.clicked', notificationId);
    },
    'click [data-loadmore]': function(event, template) {
        event.preventDefault();
        template.limit.set(template.limit.get() + 10);
        template.subscribe('chats.for_loggedin_user', {networks: true}, {});
    }
});

Template.DropdownChatNotifications.helpers({
    menuOpen: function() {
        return Template.instance().dropdownOpen.get();
    },
    notifications: function() {
        var limit = Template.instance().limit.get();
        // var parameters = {sort: {created_at: -1}, limit: limit};
        var messages = ChatMessages.find().fetch();
        // var totalNotifications = ChatMessages.find().count();
        return {
            chats: function() {
                return Partup.client.chatmessages.groupByChat(messages);
            }
            // count: function() {
            //     return totalNotifications;
            // },
            // canLoadMore: function() {
            //     return limit <= totalNotifications;
            // }
        };
    },
    totalNewNotifications: function() {
        return Notifications.findForUser(Meteor.user(), {'new': true});
    }
});
