Template.DocumentRenderer.helpers({
    getPreviewLink: function (uploadedFile) {
        if (uploadedFile.client
            && new URL(uploadedFile.link).host === 'cdn.filepicker.io') {
            return Partup.helpers.FilestackRenderer().createPreviewLinkFromDirectLink(uploadedFile.link);
        } else {
            //uploaded with (old)dropboxChooser client package
            return Partup.helpers.DropboxRenderer().createPreviewLinkFromDirectLink(
                uploadedFile.link, uploadedFile.name
            );
        }
    },
    getFileSize: Partup.helpers.bytesToSize,
    getSvgIcon: Partup.helpers.getSvgIcon
});