if (Meteor.isClient) {
    var filestackUploaderHelper = new Partup.helpers.FilestackUploader();

    Template.FilestackUploader.helpers();

    Template.FilestackUploader.events({});

    Template.FilestackUploader.onRendered(function () {

        filepicker.setKey("AB0VfDaThSQ6Sm1jvpPTyz");

        var template = Template.instance().parent();

        var $filestackUploaderTrigger = jQuery(Template.instance().data.triggerElement);

        $filestackUploaderTrigger.click(filestackUploaderTrigger);

        function filestackUploaderTrigger() {

            filepicker.pickMultiple(
                {
                    extensions: getExtensions(),
                    language: TAPi18n.getLanguage(),
                    services: ['COMPUTER', 'DROPBOX']
                }, onFilestackSuccess,
                function (fperror) {
                    Partup.client.notify.error(TAPi18n.__(fperror.toString()));
                }
            );

        }

        function getExtensions() {
            if (template.uploadedPhotos.get().length >= template.maxPhotos) {
                return filestackUploaderHelper.options.allowedExtensions.docs
            }
            else if (template.uploadedDocuments.get().length >= template.maxDocuments) {
                return filestackUploaderHelper.options.allowedExtensions.images
            }
            else {
                return filestackUploaderHelper.getAllExtensions();
            }
        }

        function allowImageUpload(template, filestackFile) {
            return (filestackUploaderHelper.fileNameIsImage(filestackFile.filename || filestackFile.name)
            && template.uploadedPhotos.get().length < template.maxPhotos)
        }

        function allowDocumentUpload(template, filestackFile) {
            return (filestackUploaderHelper.fileNameIsDoc(filestackFile.filename || filestackFile.name)
            && template.uploadedDocuments.get().length < template.maxDocuments);
        }

        function onFilestackSuccess(files) {
            var uploadPromises = [];

            files.forEach(function (filestackFile, index) {
                if (allowImageUpload(template, filestackFile)) {
                    uploadPromises.push(
                        filestackUploaderHelper.partupUploadPhoto(template, filestackFile)
                    );
                }
                else if (allowDocumentUpload(template, filestackFile)) {
                    uploadPromises.push(
                        filestackUploaderHelper.partupUploadDoc(template, filestackFile)
                    );
                }
            });

            Promise.all(uploadPromises).then(function (files) {

                files.forEach(function (filestackFile) {

                    if (allowImageUpload(template, filestackFile)) {
                        var uploaded = template.uploadedPhotos.get();
                        uploaded.push(filestackFile._id);
                        template.uploadedPhotos.set(uploaded);
                        template.uploadingPhotos.set(false);
                    }
                    else if (allowDocumentUpload(template, filestackFile)) {
                        uploaded = template.uploadedDocuments.get();
                        uploaded.push(filestackFile);
                        template.uploadedDocuments.set(uploaded);
                        template.uploadingDocuments.set(false);
                    }
                });

            });

        }

    });
}
