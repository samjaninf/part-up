var round = function(number, increment, offset) {
    return Math.ceil((number - offset) / increment) * increment + offset;
};
Partup.client.chatmessages = {
    groupByDelay: function(messages, options) {
        var delay = options.seconds ? options.seconds * 1000 : 1000;
        var outputArray = [];

        messages.forEach(function(item, index) {
            var outputLastIndex = outputArray.length - 1;
            var lastCreatedAt;
            if (outputArray[outputLastIndex]) {
                lastCreatedAt = new Date(outputArray[outputLastIndex].messages[outputArray[outputLastIndex].messages.length - 1].created_at).getTime();
            }
            var currentCreatedAt = new Date(item.created_at).getTime();
            if (outputArray[outputLastIndex] && lastCreatedAt && (currentCreatedAt - lastCreatedAt) < delay) {
                outputArray[outputLastIndex].messages.push(item);
            } else {
                outputArray.push({
                    messages: [item]
                });
            }
        });

        return outputArray;
    },
    groupByCreationDay: function(messages) {
        var outputArray = [];

        messages.forEach(function(item, index) {
            var outputLastIndex = outputArray.length - 1;
            if (outputArray[outputLastIndex] && outputArray[outputLastIndex].day === new Date(item.created_at).setHours(0, 0, 0, 0, 0)) {
                outputArray[outputLastIndex].messages.push(item);
            } else {
                outputArray.push({
                    day: new Date(item.created_at).setHours(0, 0, 0, 0, 0),
                    messages: [item]
                });
            }
        });

        return outputArray;
    },
    groupByCreatorId: function(messages) {
        var outputArray = [];
        messages.forEach(function(item, index) {
            var outputLastIndex = outputArray.length - 1;
            if (outputArray[outputLastIndex] && outputArray[outputLastIndex].creator_id === item.creator_id) {
                outputArray[outputLastIndex].messages.push(item);
            } else {
                outputArray.push({
                    creator_id: item.creator_id,
                    messages: [item]
                });
            }
        });
        return outputArray;
    },
    groupByChat: function(messages) {
        var outputObject = {};
        messages.forEach(function(item, index) {
            if (outputObject[item.chat_id] && outputObject[item.chat_id].chat_id === item.chat_id) {
                outputObject[item.chat_id].messages.push(item);
            } else {
                outputObject[item.chat_id] = {
                    chat_id: item.chat_id,
                    messages: [item]
                };
            }
        });
        var outputArray = _.values(outputObject);
        return outputArray;
    }
};
