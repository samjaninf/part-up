var round = function(number, increment, offset) {
    return Math.ceil((number - offset) / increment) * increment + offset;
};
Partup.client.chatmessages = {
    groupByCreationMinuteRange: function(messages, range) {
        var outputArray = [];

        messages.forEach(function(item, index) {
            var outputLastIndex = outputArray.length - 1;
            var minutes = round(new Date(item.created_at).getMinutes(), range, 0);
            var minute = new Date(new Date(item.created_at).setMinutes(minutes, 0, 0)).getTime();
            if (outputArray[outputLastIndex] && outputArray[outputLastIndex].minute === minute) {
                outputArray[outputLastIndex].messages.push(item);
            } else {
                outputArray.push({
                    minute: minute,
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
