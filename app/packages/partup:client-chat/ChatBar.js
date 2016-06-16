var continueOnCreated = function(chatId) {
    var template = this;
    template.chatId = chatId;
    template.clearMessageInput = function() {
        $('[data-messageinput]')[0].value = '';
    };

    // typing
    var isTyping = false;
    template.resetTypingState = function() {
        Meteor.call('chats.stopped_typing', chatId, function() {
            isTyping = false;
        });
    };

    var resetTypingStateTimeout;
    var enableTypingState = function() {
        if (!isTyping) {
            Meteor.call('chats.started_typing', chatId, new Date());
            isTyping = true;
        }
        if (resetTypingStateTimeout) clearTimeout(resetTypingStateTimeout);
        resetTypingStateTimeout = setTimeout(template.resetTypingState, Partup.client.chat.MAX_TYPING_PAUSE);
    };
    template.throttledEnableTypingState = _.throttle(enableTypingState, (Partup.client.chat.MAX_TYPING_PAUSE / 2), {leading: true, trailing: false});

    template.sendMessage = function(message) {
        if (!message) return false;

        Partup.client.chat.instantlyScrollToBottom();
        template.clearMessageInput();

        Meteor.call('chatmessages.insert', {
            chat_id: chatId,
            content: Partup.client.strings.emojify(message)
        }, function(err, res) {
            // template.sendingMessage.set(false);
            if (err) return Partup.client.notify.error('Error sending message');
            template.resetTypingState();
            Partup.client.chat.onNewMessageRender(Partup.client.chat.instantlyScrollToBottom);
        });
    };
};

Template.ChatBar.onCreated(function() {
    var template = this;

    template.autorun(function(c) {
        if (template.data.config.chatId) c.stop();
        var chatId = template.data.config.chatId ? template.data.config.chatId : template.data.config.reactiveChatId.get();

        Tracker.nonreactive(continueOnCreated.bind(template, chatId));
    });
});

Template.ChatBar.events({
    'keydown [data-submit=return]': function(event, template) {
        if (!template.chatId) return;

        // determine keycode (with cross browser compatibility)
        var pressedKey = event.which ? event.which : event.keyCode;

        // check if it's the 'return' key and if shift is NOT held down
        if (pressedKey == 13 && !event.shiftKey) {
            event.preventDefault();
            template.sendMessage($('[data-messageinput]').val());
            return false;
        } else {
            template.throttledEnableTypingState();
        }
    },
    'click [data-send]': function(event, template) {
        if (!template.chatId) return;
        event.preventDefault();
        template.sendMessage($('[data-messageinput]').val());
    }
});
