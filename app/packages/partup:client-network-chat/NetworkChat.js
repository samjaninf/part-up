Template.NetworkChat.onCreated(function() {
    var template = this;
    var networkSlug = template.data.networkSlug;
    var chatId = undefined;

    template.searching = false;
    template.MAX_TYPING_PAUSE = 5000; // 5s
    template.LIMIT = 100;
    template.oldestNewMessage = new ReactiveVar(undefined);
    template.overscroll = new ReactiveVar(false);
    template.underscroll = new ReactiveVar(false);
    template.stickyAvatar = new ReactiveVar(undefined);
    template.initialized = new ReactiveVar(false);
    template.rendered = new ReactiveVar(false);

    var initializeChat = function() {
        var chat = Chats.findOne();
        if (chat) {
            chatId = chat._id;
            template.initialized.set(true);
            return;
        }

        Meteor.call('networks.chat_insert', networkSlug, {}, function(err, chat_id) {
            if (err) return Partup.client.notify.error('Error initializing tribe chat');
            chatId = chat_id;
            template.initialized.set(true);
            Partup.client.notify.success('Tribe chat initialized');
        });
    };

    var chatSubscription = template.subscribe('networks.one.chat', networkSlug, {limit: template.LIMIT}, {onReady: initializeChat});
    template.limitReached = new ReactiveVar(false);
    template.messageLimit = new ReactiveVar(template.LIMIT, function(oldLimit, newLimit) {
        if (oldLimit !== newLimit) {
            chatSubscription = template.subscribe('networks.one.chat', networkSlug, {limit: newLimit}, {
                onReady: function() {
                    var messagesCount = ChatMessages.find({}, {limit: newLimit, sort: {created_at: 1}}).count();
                    var totalNewMessages = messagesCount - oldLimit;
                    if (totalNewMessages < 1) {
                        template.limitReached.set(true);
                    } else {
                        _.defer(function() {
                            template.ajustScrollOffsetByMessageCount(totalNewMessages);
                            template.loadingOlderMessages = false;
                        });
                    }
                }
            });
        }
    });

    template.ajustScrollOffsetByMessageCount = function(count) {
        var offset = $('[data-chat-message-id]')
            .slice(0, count)
            .map(function() {
                return $(this).outerHeight(true);
            })
            .toArray()
            .reduce(function(prevHeight, curHeight) {
                return prevHeight + curHeight;
            });
        template.scrollContainer[0].scrollTop = offset;
    };

    template.loadOlderMessages = function() {
        template.loadingOlderMessages = true;
        if (template.limitReached.get()) return;
        template.messageLimit.set(template.messageLimit.get() + template.LIMIT);
    };

    // typing
    var isTyping = false;
    template.resetTypingState = function() {
        Meteor.call('chats.stopped_typing', chatId, function() {
            isTyping = false;
        });
    };

    template.resetMessageInput = function() {
        $('[data-messageinput]')[0].value = '';
    };

    var resetTypingStateTimeout;
    var enableTypingState = function() {
        if (!isTyping) {
            Meteor.call('chats.started_typing', chatId, new Date());
            isTyping = true;
        }
        if (resetTypingStateTimeout) clearTimeout(resetTypingStateTimeout);
        resetTypingStateTimeout = setTimeout(template.resetTypingState, template.MAX_TYPING_PAUSE);
    };
    template.throttledEnableTypingState = _.throttle(enableTypingState, (template.MAX_TYPING_PAUSE / 2), {leading: true, trailing: false});

    template.sendMessage = function(message) {
        if (!message) return false;
        var scroller = template.scrollContainer;

        var currentPosition = scroller.scrollTop;
        var bottomPosition = scroller[0].scrollHeight - scroller[0].clientHeight;
        Meteor.call('chatmessages.insert', {
            chat_id: chatId,
            content: Partup.client.strings.emojify(message)
        }, function(err, res) {
            if (err) return Partup.client.notify.error('Error sending message');
            template.resetMessageInput();
            template.resetTypingState();

            if (currentPosition === bottomPosition) {
                scroller[0].scrollTop = scroller[0].scrollHeight;
            } else {
                scroller.animate({
                    scrollTop: scroller[0].scrollHeight
                }, 500);
            }
        });
    };

    template.rememberOldestNewMessage = function(oldestNewMessage) {
        if (!template.focussed && oldestNewMessage) {
            if (!template.oldestNewMessage.get()) template.oldestNewMessage.set(oldestNewMessage);
        } else if (template.focussed) {
        }
        template.ajustScrollOffset();
    };

    template.instantlyScrollToBottom = function() {
        var element = template.scrollContainer[0];
        element.scrollTop = element.scrollHeight;
    };

    template.ajustScrollOffset = function() {
        if (!template.scrollContainer) return;
        var element = template.scrollContainer[0];
        if (!element) return;
        var pos = element.scrollTop;
        var height = element.scrollHeight - element.clientHeight;
        _.defer(function() {
            if (pos === height) template.instantlyScrollToBottom();
            template.stickyNewMessagesDividerHandler();
        });
    };

    template.scrollToNewMessages = function() {
        template.overscroll.set(false);
        template.underscroll.set(false);

        var dividerElement = $('[data-new-messages-divider]');
        var scrollElement = template.scrollContainer;
        var scrollDest = dividerElement[0].offsetTop - (dividerElement.outerHeight(true));

        scrollElement.animate({
            scrollTop: scrollDest
        }, 300, function() {
            template.delayedHideLine(1000);
        });
    };

    template.focussed = true;
    template.focusHandler = function(event) {
        template.focussed = true;
        template.stickyNewMessagesDividerHandler(true);
        $('[data-messageinput]').focus();
    };
    template.blurHandler = function(event) {
        template.focussed = false;
    };
    $(window).on('focus', template.focusHandler);
    $(window).on('blur', template.blurHandler);

    template.hideTimeout;
    template.hideLine = function() {
        if (template.hideTimeout) clearTimeout(template.hideTimeout);

        var overscroll = template.overscroll.get();
        var underscroll = template.underscroll.get();
        if (overscroll || underscroll) return;

        var dividerElement = $('[data-new-messages-divider]');
        if (!dividerElement[0]) return; // maybe it's already hidden, I dunno

        // check if the divider line is visible for the user, then hide it
        var scrollElement = template.scrollContainer;
        var scrollDest = dividerElement[0].offsetTop - (scrollElement[0].clientHeight - (dividerElement[0].clientHeight * 1.5));
        if (scrollElement.scrollTop() >= scrollDest) {
            dividerElement.addClass('hide');

            // remove the oldestNewMessage when the divider has faded out
            Meteor.setTimeout(function() {
                template.oldestNewMessage.set(undefined);
            }, 250);
        }
    };
    template.delayedHideLine = function(delay) {
        if (template.hideTimeout) clearTimeout(template.hideTimeout);
        template.hideTimeout = setTimeout(template.hideLine, delay);
    };

    template.stickyNewMessagesDividerHandler = function(hideWhenViewed) {
        if ($('[data-new-messages-divider]')[0]) {
            var overscroll = $('[data-new-messages-divider]').position().top < 0;
            var underscroll = $('[data-new-messages-divider]').position().top > (template.scrollContainer[0].clientHeight - $('[data-new-messages-divider]').outerHeight(true));
            template.overscroll.set(overscroll);
            template.underscroll.set(underscroll);
            if (!overscroll && hideWhenViewed) {
                template.delayedHideLine(1000);
            }
        }
    };

    template.stickyUserAvatarHandler = function() {
        var imageId = undefined;
        var userId = undefined;

        $('[data-message-user-image-id]').each(function() {
            var elm = $(this);
            var offsetTop = elm.position().top;
            var bottomOffsetTop = offsetTop + elm.outerHeight(true);

            if (offsetTop < 25 && bottomOffsetTop > 68) {
                imageId = elm.attr('data-message-user-image-id');
                userId = elm.attr('data-message-user-id');
                var avatar = Images.findOne({_id: imageId});
                var image = Partup.helpers.url.getImageUrl(avatar, '80x80');
                $('[data-avatar]').css({
                    'background-image': 'url(' + image + ')',
                    'background-color': '#eee'
                });
                elm.addClass('pu-chatbox-noavatar');

            } else {
                // $('[data-avatar]').css('background-image', 'none');
                elm.removeClass('pu-chatbox-noavatar');
            }
            if (offsetTop < 0) {
                elm.addClass('pu-chatbox-avatar-bottom').removeClass('pu-chatbox-avatar-top');
            } else {
                elm.addClass('pu-chatbox-avatar-top').removeClass('pu-chatbox-avatar-bottom');
            }
        });
        if (userId === Meteor.userId()) {
            $('[data-sticky-avatar]').addClass('pu-sticky-user-right');
        } else {
            $('[data-sticky-avatar]').removeClass('pu-sticky-user-right');
        }
        if (!imageId) {
            $('[data-avatar]').css({
                'background-image': 'none',
                'background-color': 'transparent'
            });
        }
        template.stickyAvatar.set(userId);
    };

    // search
    template.searchQuery = new ReactiveVar('', function(oldValue, newValue) {
        if (oldValue !== newValue) {
            template.searching = (typeof newValue === 'string') && newValue.length;
            if (!template.searching) return;
            var limit = template.LIMIT;
            Meteor.call('chatmessages.search_in_network', networkSlug, newValue, {limit: limit}, function(err, res) {
                template.messages.set(res);
                _.defer(template.instantlyScrollToBottom);
            });
        }
    });
    var setSearchQuery = function(query) {
        template.searchQuery.set(query);
    };
    template.throttledSetSearchQuery = _.throttle(setSearchQuery, 500, {trailing: true});

    // message storage
    var localCollection = [];
    template.messages = new ReactiveVar([]);
    template.autorun(function() {
        var searchQuery = template.searchQuery.get();
        if (template.searching) return;
        var limit = template.messageLimit.get();
        var messages = ChatMessages.find({}, {limit: limit, sort: {created_at: 1}}).fetch();
        localCollection = localCollection.concat(messages);
        localCollection = mout.array.unique(localCollection, function(message1, message2) {
            return message1._id === message2._id;
        });
        var lastMessage = localCollection[localCollection.length - 1];
        if (lastMessage) template.rememberOldestNewMessage(lastMessage);
        template.messages.set(localCollection);
    });
});

Template.NetworkChat.onRendered(function() {
    var template = this;
    template.scrollContainer = $('[data-reversed-scroller]');
    Meteor.setTimeout(function() {
        template.scrollContainer[0].scrollTop = template.scrollContainer[0].scrollHeight;
        Meteor.setTimeout(function() {
            template.rendered.set(true);
        }, 150);
    }, 100);
});

Template.NetworkChat.onDestroyed(function() {
    var template = this;
    $(window).off('focus', template.focusHandler);
    $(window).off('blur', template.blurHandler);
    Meteor.clearInterval(template.chatTimer);
    Partup.client.chat.destroy();
});

Template.NetworkChat.helpers({
    data: function() {
        var template = Template.instance();
        var network = Networks.findOne({slug: template.data.networkSlug});
        return {
            activeUppers: function() {
                return Meteor.users.find({'status.online': true, _id: {$not: Meteor.userId(), $in: network.uppers || []}});
            },
            messagesGroupedByDay: function(messages) {
                return Partup.client.chatmessages.groupByCreationDay(messages);
            },
            messagesGroupedByUser: function(messages) {
                return Partup.client.chatmessages.groupByCreatorId(messages);
            },
            messages: function() {
                var messages = template.messages.get();
                var oldestNewMessage = template.oldestNewMessage.get();
                var dateBorder = oldestNewMessage ? oldestNewMessage.created_at : new Date();
                return {
                    old: function() {
                        return _.filter(messages, function(message) {
                            return message.created_at < dateBorder;
                        });
                    },
                    new: function() {
                        return _.filter(messages, function(message) {
                            return message.created_at >= dateBorder;
                        });
                    }
                };
            },
            chat: function() {
                return Chats.findOne();
            },
            network: function() {
                return network;
            },
            stickyAvatar: function() {
                var activeId = template.stickyAvatar.get();
                if (!activeId) return false;
                return Meteor.users.findOne(template.stickyAvatar.get());
            }
        };
    },
    state: function() {
        var template = Template.instance();
        var chat = Chats.findOne();
        return {
            overscroll: function() {
                return template.overscroll.get();
            },
            underscroll: function() {
                return template.underscroll.get();
            },
            limitReached: function() {
                return template.limitReached.get();
            },
            stickyAvatar: function() {
                return Meteor.users.findOne(template.stickyAvatar.get());
            },
            fullyLoaded: function() {
                return template.initialized.get() && template.rendered.get();
            },
            started_typing: function(user_id) {
                if (!chat) return false;
                if (!chat.started_typing) return false;
                var typing_user = lodash.find(chat.started_typing, {upper_id: user_id});
                if (!typing_user) return false;
                var started_typing_date = new Date(typing_user.date).getTime();
                var now = new Date().getTime();
                return now - started_typing_date < template.MAX_TYPING_PAUSE;
            },
            reactiveQuery: function() {
                return template.searchQuery;
            }
        };
    }
});
Template.NetworkChat.events({
    'keydown [data-submit=return]': function(event, template) {
        // determine keycode (with cross browser compatibility)
        var pressedKey = event.which ? event.which : event.keyCode;

        // check if it's the 'return' key and if shift is NOT held down
        if (pressedKey == 13 && !event.shiftKey) {
            event.preventDefault();
            template.sendMessage($('[data-messageinput]').val());
        } else {
            template.throttledEnableTypingState();
        }
    },
    'click [data-send]': function(event, template) {
        event.preventDefault();
        template.sendMessage($('[data-messageinput]').val());
    },
    'click [data-scrollto]': function(event, template) {
        event.preventDefault();
        template.scrollToNewMessages();
    },
    'click [data-load-old]': function(event, template) {
        event.preventDefault();
        template.loadOlderMessages();
    },
    'scroll [data-reversed-scroller]': function(event, template) {
        if (event.currentTarget.scrollTop < 200 && !template.loadingOlderMessages && !template.searching) {
            template.loadOlderMessages();
        }
        template.stickyUserAvatarHandler();
    },
    'DOMMouseScroll [data-preventscroll], mousewheel [data-preventscroll]': Partup.client.scroll.preventScrollPropagation,
    'DOMMouseScroll [data-reversed-scroller], mousewheel [data-reversed-scroller]': function(event, template) {
        template.stickyNewMessagesDividerHandler(true);
    },
    'click [data-flexible-center]': function(event, template) {
        event.preventDefault();
        $(event.currentTarget).parent().addClass('start');
        _.defer(function() {
            $(event.currentTarget).parent().addClass('active');
            $('[data-search]').focus();
        });
    },
    'click [data-clear]': function(event, template) {
        event.preventDefault();
        event.stopPropagation();
        $('[data-search]').val('');
        _.defer(function() {
            template.throttledSetSearchQuery('');
            $('[data-search]').blur();
        });
    },
    'input [data-search]': function(event, template) {
        template.throttledSetSearchQuery(event.currentTarget.value);
    },
    'focus [data-search]': function(event, template) {
        $(event.currentTarget).parent().addClass('start');
        _.defer(function() {
            template.focussed = true;
            $(event.currentTarget).parent().addClass('active');
        });
    },
    'blur [data-search]': function(event, template) {
        if (!$(event.target).val()) {
            template.focussed = false;
            $('[data-flexible-center]').parent().removeClass('active');
        }
    },
    'transitionend [data-flexible-center]': function(event, template) {
        $(event.currentTarget).parent().removeClass('start');
    }
});
