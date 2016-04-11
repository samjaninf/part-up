DropboxChooser = function (options) {
        this.options = _.extend({
            allowedExtensions: {
                images: Partup.helpers.imageExtensions,
                docs: _.flatten([
                    Partup.helpers.pdfExtensions,
                    Partup.helpers.docExtensions,
                    Partup.helpers.presentationExtensions,
                    Partup.helpers.fallbackFileExtensions
                ])
            }
        }, options);
    } || {};

DropboxChooser.prototype.getAllExtensions = function () {
    var self = this;
    return _.chain(self.options.allowedExtensions).keys().map(function (type) {
        return self.options.allowedExtensions[type];
    }).flatten().value();
};

DropboxChooser.prototype.getExtensionFromFileName = function (filename) {
    return filename.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/)[0];
};

DropboxChooser.prototype.fileNameIsImage = function (fileName) {
    return _.include(this.options.allowedExtensions.images,
        this.getExtensionFromFileName(fileName)
    );
};

DropboxChooser.prototype.fileNameIsDoc = function (fileName) {
    return _.include(this.options.allowedExtensions.docs,
        this.getExtensionFromFileName(fileName)
    );
};


DropboxChooser.prototype.partupUploadPhoto = function (template, dropboxFile) {
    template.uploadingPhotos.set(true);
    return new Promise(function (resolve, reject) {
        Partup.client.uploader.uploadImageByUrl(dropboxFile.link, function (error, image) {
            if (error) {
                Partup.client.notify.error(TAPi18n.__(error.reason));
                return reject(error);
            }
            dropboxFile._id = image._id;
            resolve(dropboxFile);
        });
    });
};

DropboxChooser.prototype.partupUploadDoc = function (template, dropboxFile) {
    template.uploadingDocuments.set(true);
    return new Promise(function (resolve, reject) {
        dropboxFile._id = new Meteor.Collection.ObjectID()._str;

        if (!dropboxFile._id) {
            return reject(new Error('meteor _id is not created!'));
        }
        resolve(dropboxFile);
    });
};

Partup.helpers.DropboxChooser = DropboxChooser;

var DropboxRenderer = function () {

    return {
        getFileIdFromDirectLink: getFileIdFromDirectLink,
        createPreviewLinkFromDirectLink: createPreviewLinkFromDirectLink,
        getSvgIcon: Partup.helpers.getSvgIcon,
        bytesToSize: Partup.helpers.bytesToSize
    };

    function getFileIdFromDirectLink(fileUrl) {
        return fileUrl.match(/view\/(\w+)/)[1];
    }

    function createPreviewLinkFromDirectLink(directLinkUrl, fileName) {
        var fileId = getFileIdFromDirectLink(directLinkUrl);
        return 'https://www.dropbox.com/s/' + fileId + '/' + fileName + '?dl=0';
    }
};

Partup.helpers.DropboxRenderer = DropboxRenderer;
