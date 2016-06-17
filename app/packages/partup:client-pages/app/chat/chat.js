Template.app_chat.onCreated(function() {
    var template = this;
});
Template.app_chat.helpers({
    chatId: function() {
        var template = Template.instance();
        return template.data ? template.data.chatId : undefined;
    }
})
