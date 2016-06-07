Meteor.methods({
    /**
     * Insert a chat
     *
     * @param {mixed[]} fields
     */
    'chats.insert': function(fields) {
        check(fields, Partup.schemas.forms.chat);

        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        try {
            var chat = {
                _id: Random.id(),
                created_at: new Date(),
                started_typing: [],
                updated_at: new Date(),
                counter: []
            };

            Chats.insert(chat);

            return chat._id;
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chat_could_not_be_inserted');
        }
    },

    /**
     * Set current user as started typing
     *
     * @param {String} chatId
     * @param {Date} typingDate
     */
    'chats.started_typing': function(chatId, typingDate) {
        check(chatId, String);

        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        try {
            var chat = Chats.findOneOrFail(chatId);
            chat.startedTyping(user._id, typingDate);
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chats_started_typing_could_not_be_updated');
        }
    },

    /**
     * Set current user as started typing
     *
     * @param {String} chatId
     */
    'chats.stopped_typing': function(chatId) {
        check(chatId, String);

        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        try {
            var chat = Chats.findOneOrFail(chatId);
            chat.stoppedTyping(user._id);
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chats_started_typing_could_not_be_updated');
        }
    },

    /**
     * Start a chat with the provided users
     */
    'chats.start_with_users': function(userIds) {
        check(userIds, [String]);

        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');
        var chatId = undefined;

        // Don't allow chat's with yourself
        if (userIds.indexOf(user._id) > -1) throw new Meteor.Error(400, 'chat_could_not_be_started');

        try {
            // If the chat is with 1 user then check if there is already a chat going on
            if (userIds.length < 2) {
                var userChats = user.chats || [];
                var recipient = Meteor.users.findOne({chats: {$in: userChats}, _id: {$in: userIds, $ne: user._id}});
                if (recipient) {
                    return lodash.intersection(userChats, recipient.chats)[0];
                }
            }

            chatId = Meteor.call('chats.insert', {});
            Chats.update(chatId, {$set: {creator_id: user._id}});
            userIds.unshift(user._id);
            Meteor.users.update({_id: {$in: userIds}}, {$push: {chats: chatId}}, {multi: true});

            return chatId;
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chat_could_not_be_started');
        }
    }
});
