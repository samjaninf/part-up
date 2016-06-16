Template.OneOnOneChatSidebar.onCreated(function() {
    var template = this;
    template.searchValue = new ReactiveVar(undefined);
    template.searchResults = new ReactiveVar(undefined);

    var searchUser = function(query) {
        template.searchValue.set(query);
        if (!query.length) return template.searchResults.set(undefined);
        var currentQuery = query;
        Meteor.call('users.autocomplete', query, undefined, undefined, {chatSearch: true}, function(err, users) {
            if (err) return Partup.client.notify.error('something went wrong');

            if (query === currentQuery) template.searchResults.set(users);
        });
    };
    template.throttledSearchUser = _.throttle(searchUser, 500, {trailing: true});
});

Template.OneOnOneChatSidebar.helpers({
    data: function() {
        var template = Template.instance();
        var user = Meteor.user();
        return {
            chats: function() {
                if (!user.chats.length) return [];
                return Chats
                    .find({_id: {$in: user.chats}})
                    .map(function(chat) {
                        chat.upper = Meteor.users
                            .findOne({_id: {$nin: [user._id]}, chats: {$in: [chat._id]}});
                        return chat;
                    });
            },
            searchValue: function() {
                return template.searchValue.get();
            },
            searchResults: function() {
                return template.searchResults.get();
            }
        };
    }
});

Template.OneOnOneChatSidebar.events({
    'DOMMouseScroll [data-preventscroll], mousewheel [data-preventscroll]': Partup.client.scroll.preventScrollPropagation,
    'input [data-search]': function(event, template) {
        template.throttledSearchUser(event.currentTarget.value);
    },
    'click [data-clear]': function(event, template) {
        event.preventDefault();
        event.stopPropagation();
        $('[data-search]').val('');
        _.defer(function() {
            template.throttledSearchUser('');
            $('[data-search]').blur();
        });
    },
    'click [data-start]': function(event, template) {
        event.preventDefault();
        var userId = $(event.currentTarget).data('start');
        template.data.config.onStartChat(userId);
        template.throttledSearchUser('');
    },
    'click [data-initialize]': function(event, template) {
        event.preventDefault();
        var chatId = $(event.currentTarget).data('initialize');
        var person = $(event.currentTarget).data('person');
        template.data.config.onInitializeChat(chatId, Meteor.users.findOne(person));
        template.throttledSearchUser('');
    }
});
