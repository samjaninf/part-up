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
 * @param {String} userId the user id of the user that started typing
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
 * @param {String} userId the user id of the user that stopped typing
 */
Chat.prototype.stoppedTyping = function(userId) {
    Chats.update(this._id, {$pull: {started_typing: {upper_id: userId}}});
};

/**
 * Get the unread chat count
 *
 * @memberOf Chats
 * @param {String} userId
 * @return {Mongo.Cursor}
 */
Chat.prototype.getUnreadCountForUser = function(userId) {
    var user = Meteor.users.findOne(userId);
    return ChatMessages.find({chat_id: this._id, read_by: {$nin: [user._id]}}).count();
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
