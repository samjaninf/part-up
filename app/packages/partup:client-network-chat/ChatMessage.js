Template.ChatMessage.onCreated(function() {
    var template = this;
    template.subscribe('users.one', template.data.data.creator_id);
    template.highlight = template.data.highlight;
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
            }
        };
    }
});
