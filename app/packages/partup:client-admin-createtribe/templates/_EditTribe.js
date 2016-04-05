/**
 */
Template._EditTribe.onCreated(function() {
    var template = this;
    template.submitting = new ReactiveVar(false);
});

Template._EditTribe.helpers({
    formSchema: Partup.schemas.forms.networkEdit,
    fieldsFromNetworkAdmin: function() {
        var network = Networks.findOne({slug: Template.instance().data.networkSlug.get()});
        return Partup.transformers.network.toFormNetworkAdmin(network)
    },
    submitting: function() {
        return Template.instance().submitting.get();
    },
    networkSlug: function() {
        return Template.instance().data.networkSlug.get();
    }
});

AutoForm.hooks({
    editTribeForm: {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            var self = this;
            var template = self.template.parent();

            var parent = Template.instance().parent();
            parent.submitting.set(true);

            Meteor.call('networks.admin_update', template.data.networkSlug.get(), insertDoc, function(error, result) {
                parent.submitting.set(false);
                if (error) {
                    return Partup.client.notify.error(TAPi18n.__('base-errors-' + error.reason));
                }
                Partup.client.popup.close();
            });

            return false;
        }
    }
});
