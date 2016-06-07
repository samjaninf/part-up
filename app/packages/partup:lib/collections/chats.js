/**
 * Chat model
 *
 * @memberOf Chats
 */
var Chat = function(document) {
    _.extend(this, document);
};

/**
 * Set a user as typing
 *
 * @memberOf Chats
 * @param {String} userId the id of the user that started typing
 * @param {Date} typingDate the front-end date of when the user started typing
 */
Chat.prototype.startedTyping = function(userId, typingDate) {
    var typingObject = Chats.findOne({_id: this._id, 'started_typing.upper_id': userId});
    if (typingObject) {
        Chats.update({_id: this._id, 'started_typing.upper_id': userId}, {$set: {'started_typing.$.date': typingDate}});
    } else {
        Chats.update(this._id, {$push: {started_typing: {upper_id: userId, date: typingDate}}});
    }
};

/**
 * Unset a typing user
 *
 * @memberOf Chats
 * @param {String} userId the id of the user that stopped typing
 */
Chat.prototype.stoppedTyping = function(userId) {
    Chats.update(this._id, {$pull: {started_typing: {upper_id: userId}}});
};

/**
 * Add a user to the counter array
 *
 * @memberOf Chats
 * @param {String} userId the id of the user that needs to be added
 */
Chat.prototype.addUserToCounter = function(userId) {
    Chats.update({
        _id: this._id,
        'counter.user_id': {
            $ne: userId
        }
    }, {
        $push: {
            counter: {
                user_id: userId,
                unread_count: 0
            }
        }
    });
};

/**
 * Increment unread messages counter
 *
 * @memberOf Chats
 * @param {String} creatorUserId the id of the creator of a message
 */
Chat.prototype.incrementCounter = function(creatorUserId) {
    var counter = Chats.findOneOrFail(this._id).counter;
    counter.forEach(function(counter) {
        if (counter.user_id === creatorUserId) return;
        counter.unread_count++
    });
    Chats.update(this._id, {$set: {counter: counter}});
};

/**
 * Reset unread messages counter
 *
 * @memberOf Chats
 * @param {String} userId the id of the user to reset
 */
Chat.prototype.resetCounterForUser = function(userId) {
    Chats.update({
        _id: this._id,
        'counter.user_id': userId
    }, {
        $set: {
            'counter.$.unread_count': 0
        }
    });
};

/**
 * Remove a user from the counter array
 *
 * @memberOf Chats
 * @param {String} userId the id of the user that needs to be removed
 */
Chat.prototype.removeUserFromCounter = function(userId) {
    Chats.update({
        _id: this._id,
        'counter.user_id': userId
    }, {
        $pull: {counter: {user_id: userId}}
    });
};

/**
 @namespace Chats
 */
Chats = new Mongo.Collection('chats', {
    transform: function(document) {
        return new Chat(document);
    }
});

/**
 * Find chats for a single user
 *
 * @memberOf Chats
 * @param {String} userId
 * @param {Object} parameters
 * @param {Boolean} parameters.private Set true when you need to incluce the private chats
 * @param {Boolean} parameters.networks Set true when you need to incluce the network chats
 * @param {Object} options
 * @return {Mongo.Cursor}
 */
Chats.findForUser = function(userId, parameters, options) {
    options = options || {};
    parameters = parameters || {};
    var user = Meteor.users.findOneOrFail(userId);
    var chatIds = [];

    if (parameters.private) {
        // Add the private chats
        var userChats = user.chats || [];
        chatIds.concat(userChats);
    }

    if (parameters.networks) {
        // And now collect the tribe chats
        var userNetworks = user.networks || [];
        var networks = Networks.find({_id: {$in: userNetworks}});
        networks.forEach(function(network) {
            if (network.chat_id) chatIds.push(network.chat_id);
        });
    }

    if (!options.sort) {
        options.sort = {updated_at: -1};
    }

    // Return the IDs ordered by most recent
    return Chats.find({_id: {$in: chatIds}}, options);
};
