Partup.client.chat = {
    _chat_timekeeper: new ReactiveDict(),
    _current_chat: undefined,
    MAX_TYPING_PAUSE: 5000, // 5s
    initialize: function(template) {
        this._current_chat = template;
    },
    destroy: function() {
        this._chat_timekeeper.clear();
        this._current_chat = undefined;
    },
    instantlyScrollToBottom: function() {
        if (!this._current_chat) return;

        this._current_chat.instantlyScrollToBottom();
    },
    ajustScrollOffsetByMessageCount: function(count) {
        if (!this._current_chat) return;

        this._current_chat.ajustScrollOffsetByMessageCount(count);
    },
    onNewMessageRender: function(cb) {
        if (!this._current_chat) return;

        this._current_chat.onNewMessageRender(cb);
    }
};
