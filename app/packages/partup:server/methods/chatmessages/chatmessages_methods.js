Meteor.methods({
    /**
     * Insert a chat message in the chat
     *
     * @param {mixed[]} fields
     */
    'chatmessages.insert': function(fields) {
        check(fields, Partup.schemas.forms.chatMessage);

        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        try {
            var chat = Chats.findOneOrFail(fields.chat_id);

            var chatMessage = {
                _id: Random.id(),
                chat_id: chat._id,
                content: fields.content,
                created_at: new Date(),
                creator_id: user._id,
                read_by: [],
                seen_by: [],
                updated_at: new Date()
            };

            // Insert message
            ChatMessages.insert(chatMessage);

            // Update the chat
            Chats.update(chat._id, {$set: {updated_at: new Date()}});

            // Find possible network
            const network = Networks.findOne({chat_id: chat._id});

            if (!network) {
                // It's a 1-on-1 chat!

                // Find participants
                const receivers = Meteor.users.find({chats: {$in: [chat._id]}}).fetch()
                    .map(function(user) {
                        return user._id;
                    })
                    .filter(function(id) {
                        return id !== user._id;
                    });

                // Send push notification
                var filterDevices = function() {return true; }; // all devices
                var message = user.profile.name + ': ' + fields.content; //todo TAPi18n.__('', {sender: user.profile.name, message: fields.content});
                var payload = {
                    chat: {
                        _id: chat._id
                    }
                };

                Partup.server.services.pushnotifications.send(receivers, filterDevices, message, payload);
            }


            return chatMessage._id;
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chatmessage_could_not_be_inserted');
        }
    },

    /**
     * Remove a chat message from the chat
     *
     * @param {String} chatMessageId
     */
    'chatmessages.remove': function(chatMessageId) {
        check(chatMessageId, String);

        var user = Meteor.user();
        var chatMessage = ChatMessages.findOne(chatMessageId);
        if (!user || !chatMessage || chatMessage.creator_id !== user._id) throw new Meteor.Error(401, 'unauthorized');

        try {
            ChatMessages.remove(chatMessage._id);
        } catch (error) {
            throw new Meteor.Error(400, 'chatmessage_could_not_be_deleted');
        }
    },

    /**
     * Add upper to seen list
     *
     * @param {String} chatMessageId
     */
    'chatmessages.seen': function(chatMessageId) {
        check(chatMessageId, String);

        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        try {
            var chatMessage = ChatMessages.findOne(chatMessageId);
            chatMessage.addToSeen(user._id);
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chatmessage_could_not_be_inserted');
        }
    },

    /**
     * Add upper to read list (and automatically to seen)
     *
     * @param {String} chatMessageId
     */
    'chatmessages.read': function(chatMessageId) {
        check(chatMessageId, String);

        var user = Meteor.user();
        if (!user) throw new Meteor.Error(401, 'unauthorized');

        try {
            var chatMessage = ChatMessages.findOne(chatMessageId);
            chatMessage.addToSeen(user._id);
            chatMessage.addToRead(user._id);
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chatmessage_could_not_be_inserted');
        }
    },

    /**
     * Search chatmessages in a network
     *
     * @param {String} networkSlug
     * @param {String} query
     * @param {Object} options
     */
    'chatmessages.search_in_network': function(networkSlug, query, options) {
        // Temp disable
        return;

        check(networkSlug, String);
        check(query, String);
        check(options, {
            limit: Match.Optional(Number),
            skip: Match.Optional(Number)
        });

        var user = Meteor.user();
        var network = Networks.findOneOrFail({slug: networkSlug});
        if (!user || !network.hasMember(user._id)) throw new Meteor.Error(401, 'unauthorized');

        try {
            return ChatMessages.find({content: new RegExp('.*' + query + '.*', 'i')}, options).fetch();
        } catch (error) {
            Log.error(error);
            throw new Meteor.Error(400, 'chatmessages_could_not_be_searched');
        }
    }
});
