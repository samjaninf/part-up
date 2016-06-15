Template.OneOnOneChatSidebar.onCreated(function() {
    var template = this;
    template.searchValue = new ReactiveVar(undefined);
});

Template.OneOnOneChatSidebar.helpers({
    data: function() {
        var template = Template.instance();
        return {
            chats: function() {
                return Chats.find();
            },
            searchValue: function() {
                return template.searchValue.get();
            }
        };
    }
});

Template.OneOnOneChatSidebar.events({
    'input [data-search]': function(event, template) {
        template.data.config.onSearch(event.currentTarget.value);
        template.searchValue.set(event.currentTarget.value);
    },
    'click [data-clear]': function(event, template) {
        event.preventDefault();
        event.stopPropagation();
        $('[data-search]').val('');
        _.defer(function() {
            template.data.config.onSearch('');
            template.searchValue.set('');
            $('[data-search]').blur();
        });
    }
})
