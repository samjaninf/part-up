/** re-usable functions for this newmesage.js template */
var placeholders = {
    'text': function () {
        return TAPi18n.__('pages-app-partup-updates-newmessage-placeholder');
    }
};

function uploadingMedia() {
    var uploading = [
        Template.instance().uploadingPhotos.get(),
        Template.instance().uploadingDocuments.get()
    ];

    uploading = _.countBy(uploading, function (value) {
        return (value) ? 'isActive' : 'notActive';
    });

    return uploading.isActive > 0;
}

function mediaLimitReached() {
    var mediaItems = Template.instance().uploadedPhotos.get().length +
        Template.instance().uploadedDocuments.get().length;

    return mediaItems === Template.instance().maxMediaItems;
}

function photoLimitReached() {
    return Template.instance().uploadedPhotos.get().length === Template.instance().maxPhotos;
}

function documentLimitReached() {
    return Template.instance().uplodedDocuments.get().length === Template.instance().maxDocuments;
}

function toggleMenu($toggleContainer) {
    var $button = $toggleContainer.find('.pu-sub-container button');
    var $ul = $toggleContainer.find('ul.pu-dropdown');
    var $icon = $button.find('i');

    var openMenu = function () {
        $toggleContainer.addClass('pu-formdropdown-active');
        $ul.addClass('pu-dropdown-active');
        $icon.removeClass('picon-caret-down');
        $icon.addClass('picon-caret-up');
    };

    var closeMenu = function () {
        $toggleContainer.removeClass('pu-formdropdown-active');
        $ul.removeClass('pu-dropdown-active');
        $icon.addClass('picon-caret-down');
        $icon.removeClass('picon-caret-up');
    };

    if ($icon.hasClass('picon-caret-down')) {
        openMenu();
        $(document).one('click', closeMenu);
    } else {
        closeMenu();
    }
}
/** end re-usable functions for this newmesage.js template */

Template.app_partup_updates_newmessage.onCreated(function () {
    var template = this;

    template.uploadingPhotos = new ReactiveVar(false);
    var images = this.data._id ? this.data.type_data.images : [];
    template.uploadedPhotos = new ReactiveVar(images);
    template.totalPhotos = new ReactiveVar(0);
    template.maxPhotos = 4;
    template.submitting = new ReactiveVar(false);
    template.partupId = this.data.partup_id || this.data.partupId;

    template.uploadingDocuments = new ReactiveVar(false);
    var documents = this.data._id && this.data.type_data.documents ? this.data.type_data.documents : [];
    template.uploadedDocuments = new ReactiveVar(documents);
    template.totalDocuments = new ReactiveVar(0);
    template.maxDocuments = 2;

    template.maxMediaItems = template.maxPhotos + template.maxDocuments;
});

Template.afFieldInput.onRendered(function () {
    // makes sure it only goes on if it's a mentions input
    if (!this.data.hasOwnProperty('data-message-input')) return;

    // comment template
    var template = this.parent();
    var currentValue = template.data._id ? template.data.type_data.new_value : undefined;

    // destroy other edit mentionsinputs to prevent conflicts
    if (template.mentionsInput) template.mentionsInput.destroy();

    var input = template.find('[data-message-input]');
    template.mentionsInput = Partup.client.forms.MentionsInput(input, template.partupId, {
        autoFocus: true,
        autoAjustHeight: true,
        prefillValue: currentValue
    });
});

Template.app_partup_updates_newmessage.onDestroyed(function () {
    var tpl = this;
    if (tpl.mentionsInput) tpl.mentionsInput.destroy();
});

// helpers
Template.app_partup_updates_newmessage.helpers({
    formSchema: Partup.schemas.forms.newMessage,
    placeholders: placeholders,
    uploadingPhotos: function () {
        return Template.instance().uploadingPhotos.get();
    },
    uploadedPhotos: function () {
        return Template.instance().uploadedPhotos.get();
    },
    photoLimitReached: photoLimitReached,
    uploadingDocuments: function () {
        return Template.instance().uploadingDocuments.get();
    },
    uploadedDocuments: function () {
        return Template.instance().uploadedDocuments.get();
    },
    documentLimitReached: documentLimitReached,
    mediaLimitReached: mediaLimitReached,
    uploadingMedia: uploadingMedia,
    hasUploadedMedia: function () {
        return (
            Template.instance().uploadedPhotos.get().length ||
            Template.instance().uploadedDocuments.get().length
        )
    },
    imagesLeft: function() {
      return  Template.instance().maxPhotos - Template.instance().uploadedPhotos.get().length;
    },
    documentsLeft: function() {
        return  Template.instance().maxDocuments - Template.instance().uploadedDocuments.get().length;
    },
    submitting: function () {
        return Template.instance().submitting.get();
    },
    state: function () {
        var self = this;
        var template = Template.instance();
        return {
            edit: function () {
                return self._id ? true : false;
            },
            formId: function () {
                return self._id ? 'editMessageForm' : 'newMessageForm';
            }
        };
    },
    formDoc: function () {
        if (!this._id) return;
        return {
            text: this.type_data.new_value,
            images: this.type_data.images || [],
            documents: this.type_data.documents || []
        };
    },
    getSvgIcon: Partup.helpers.getSvgIcon,
    disabledImageUploadFile: function () {
        return (photoLimitReached()) ? 'disabled' : '';
    },
    imageExtensions: function() {
        return Partup.helpers.imageExtensions.join(', ');
    }
});

// events
Template.app_partup_updates_newmessage.events({
    'click [data-toggle-add-media-menu]': function (event, template) {
        event.stopImmediatePropagation();
        event.preventDefault();
        if (!mediaLimitReached()) {
            // toggleMenu($(event.currentTarget));
        }
    },
    'click [data-dismiss]': function clearForm(event, template) {
        template.uploadedPhotos.set([]);
        template.uploadedDocuments.set([]);
    },
    'click [data-type="image"][data-remove-upload]': function removeUpload(event, template) {
        var imageId = $(event.currentTarget).data('remove-upload');
        // template.uploadedPhotos.set([]);
        var uploadedPhotos = template.uploadedPhotos.get();
        mout.array.remove(uploadedPhotos, imageId);
        template.uploadedPhotos.set(uploadedPhotos);
        var total = Template.instance().totalPhotos.get();
        total--;
        Template.instance().totalPhotos.set(total);
    },
    'click [data-type="document"][data-remove-upload]': function removeUpload(event, template) {
        var documentId = $(event.currentTarget).data('remove-upload');
        var uploadedDocuments = template.uploadedDocuments.get();
        uploadedDocuments = _.without(uploadedDocuments, _.findWhere(uploadedDocuments, {_id: documentId}));
        template.uploadedDocuments.set(uploadedDocuments);
        var total = Template.instance().totalDocuments.get();
        total--;
        Template.instance().totalDocuments.set(total);
    }
});

/*************************************************************/
/* Widget form hooks */
/*************************************************************/
AutoForm.hooks({
    editMessageForm: {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {
            var self = this;
            var parent = Template.instance().parent();
            var template = self.template.parent();

            parent.submitting.set(true);

            var updateId = parent.data._id;

            var uploadedPhotos = parent.uploadedPhotos.get();
            insertDoc.images = uploadedPhotos;
            insertDoc.text = parent.mentionsInput.getValue();

            var uploadedDocuments = parent.uploadedDocuments.get();
            insertDoc.documents = uploadedDocuments;

            // close popup before call is made, an error notifier
            // will be the feedback when it fails
            Partup.client.popup.close();

            Meteor.call('updates.messages.update', updateId, insertDoc, function (error, result) {
                parent.submitting.set(false);

                // Error
                if (error) {
                    Partup.client.notify.error(error.reason);
                    self.done(new Error(error.message));
                    return;
                }

                try {
                    AutoForm.resetForm('editMessageForm');
                } catch (err) {
                }
                template.mentionsInput.reset();
                self.done();
                parent.uploadedPhotos.set([]);
                parent.uploadedDocuments.set([]);
            });

            return false;
        }
    },
    newMessageForm: {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {
            var self = this;
            var parent = Template.instance().parent();
            var template = self.template.parent();

            parent.submitting.set(true);

            var partupId = parent.data.partupId;
            var uploadedPhotos = parent.uploadedPhotos.get();
            insertDoc.images = uploadedPhotos;
            insertDoc.text = parent.mentionsInput.getValue();

            var uploadedDocuments = parent.uploadedDocuments.get();
            insertDoc.documents = uploadedDocuments;

            // close popup before call is made, an error notifier
            // will be the feedback when it fails
            Partup.client.popup.close();
            Partup.client.updates.setWaitForUpdate(true);

            Meteor.call('updates.messages.insert', partupId, insertDoc, function (error, result) {
                parent.submitting.set(false);
                Partup.client.updates.addUpdateToUpdatesCausedByCurrentuser(result._id);
                Partup.client.updates.setWaitForUpdate(false);

                // Error
                if (error) {
                    Partup.client.notify.error(error.reason);
                    self.done(new Error(error.message));

                    return;
                }
                if (result.warning) {
                    Partup.client.notify.warning(TAPi18n.__('warning-' + result.warning));
                }

                // Success
                analytics.track('new message created', {
                    partupId: partupId
                });
                try {
                    AutoForm.resetForm('newMessageForm');
                } catch (err) {
                }
                template.mentionsInput.reset();
                self.done();
                parent.uploadedPhotos.set([]);
                parent.uploadedDocuments.set([]);
                Partup.client.events.emit('partup:updates:message_added');
            });

            return false;
        }
    }
});
