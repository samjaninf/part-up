if (Meteor.isClient) {
    var dropboxHelper = new Partup.helpers.DropboxChooser();

    Template.DropboxChooser.helpers();

    Template.DropboxChooser.events({});

    Template.DropboxChooser.onRendered(function () {

        /**
         * part-up webapp, Dropbox Developer console
         */
        Dropbox.init({appKey: 'le3ovpnhqs4qy9g'});

        var template = Template.instance().parent();

        var $dropboxChooser = jQuery('[data-dropbox-chooser]');

        $dropboxChooser.click(dropboxChooserTrigger);

        function dropboxChooserTrigger() {

            Dropbox.choose({
                success: onDropboxSuccess,
                linkType: "direct", // or "preview"
                multiselect: true, // or true
                extensions: getExtensions()
            });
        }

        function getExtensions() {
            if(template.uploadedPhotos.get().length >= template.maxPhotos) {
                return dropboxHelper.options.allowedExtensions.docs
            }
            else if(template.uploadedDocuments.get().length >= template.maxDocuments) {
                return dropboxHelper.options.allowedExtensions.images
            }
            else {
                return dropboxHelper.getAllExtensions();
            }
        }

        function allowImageUpload(template, dropboxFile) {
            return (dropboxHelper.fileNameIsImage(dropboxFile.filename)
            && template.uploadedPhotos.get().length < template.maxPhotos)
        }

        function allowDocumentUpload(template, dropboxFile) {
            return (dropboxHelper.fileNameIsDoc(dropboxFile.filename)
            && template.uploadedDocuments.get().length < template.maxDocuments);
        }

        function onDropboxSuccess(files) {
            var uploadPromises = [];

            files.forEach(function (dropboxFile, index) {
                if (allowImageUpload(template, dropboxFile)) {
                    uploadPromises.push(
                        dropboxHelper.partupUploadPhoto(template, dropboxFile)
                    );
                }
                else if (allowDocumentUpload(template, dropboxFile)) {
                    uploadPromises.push(
                        dropboxHelper.partupUploadDoc(template, dropboxFile)
                    );
                }
            });

            Promise.all(uploadPromises).then(function (files) {

                files.forEach(function (dropboxFile) {

                    if (allowImageUpload(template, dropboxFile)) {
                        var uploaded = template.uploadedPhotos.get();
                        uploaded.push(dropboxFile._id);
                        template.uploadedPhotos.set(uploaded);
                        template.uploadingPhotos.set(false);
                    }
                    else if (allowDocumentUpload(template, dropboxFile)) {
                        uploaded = template.uploadedDocuments.get();
                        uploaded.push(dropboxFile);
                        template.uploadedDocuments.set(uploaded);
                        template.uploadingDocuments.set(false);
                    }
                });

            });

        }

    });
}
