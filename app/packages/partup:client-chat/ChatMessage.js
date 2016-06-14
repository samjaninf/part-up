Template.ChatMessage.onCreated(function() {
    var template = this;
    template.subscribe('users.one', template.data.data.creator_id);
});

Template.ChatMessage.onRendered(function() {
    var template = this;
});

Template.ChatMessage.helpers({
    data: function() {
        var template = Template.instance();
        var data = template.data.data;
        var user = Meteor.users.findOne(data.creator_id);
        return {
            messageCreator: function() {
                return user;
            },
            messages: function() {
                data.messages[0].creator = user;
                return data.messages;
            },
            highlight: function() {
                return template.data.highlight.get() || '';
            }
        };
    },
    handlers: function() {
        var template = Template.instance();
        return {
            onNewMessageRender: function() {
                return template.data.onNewMessageRender;
            }
        };
    }
});
