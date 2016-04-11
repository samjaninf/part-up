FilestackUploader = function () {
        this.options = {
            allowedExtensions: {
                images: Partup.helpers.imageExtensions,
                docs: _.flatten([
                    Partup.helpers.pdfExtensions,
                    Partup.helpers.docExtensions,
                    Partup.helpers.presentationExtensions,
                    Partup.helpers.fallbackFileExtensions
                ])
            }
        };
    } || {};

FilestackUploader.prototype.getAllExtensions = function () {
    var self = this;
    return _.chain(self.options.allowedExtensions).keys().map(function (type) {
        return self.options.allowedExtensions[type];
    }).flatten().value();
};

FilestackUploader.prototype.getExtensionFromFileName = function (fileName) {
    return fileName.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/)[0];
};

FilestackUploader.prototype.fileNameIsImage = function (fileName) {
    return _.include(this.options.allowedExtensions.images,
        this.getExtensionFromFileName(fileName).toLowerCase()
    );
};

FilestackUploader.prototype.fileNameIsDoc = function (fileName) {
    return _.include(this.options.allowedExtensions.docs,
        this.getExtensionFromFileName(fileName).toLowerCase()
    );
};


FilestackUploader.prototype.partupUploadPhoto = function (template, filestackFile) {
    template.uploadingPhotos.set(true);
    return new Promise(function (resolve, reject) {

        filestackFile.name = filestackFile.filename;
        filestackFile.bytes = filestackFile.size;
        filestackFile.link = filestackFile.url;

        filestackFile = _.omit(filestackFile, 'id', 'filename', 'size', 'url', 'mimetype', 'isWriteable');

        Partup.client.uploader.uploadImageByUrl(filestackFile.link, function (error, image) {
            if (error) {
                Partup.client.notify.error(TAPi18n.__(error.reason));
                return reject(error);
            }
            filestackFile._id = image._id;
            resolve(filestackFile);
        });
    });
};

FilestackUploader.prototype.partupUploadDoc = function (template, filestackFile) {
    template.uploadingDocuments.set(true);
    return new Promise(function (resolve, reject) {
        filestackFile.name = filestackFile.filename;
        filestackFile.bytes = filestackFile.size;
        filestackFile.link = filestackFile.url;
        filestackFile._id = new Meteor.Collection.ObjectID()._str;

        filestackFile = _.omit(filestackFile, 'id', 'filename', 'size', 'url', 'mimetype', 'isWriteable');

        if (!filestackFile._id) {
            return reject(new Error('meteor _id is not created!'));
        }
        resolve(filestackFile);
    });
};

Partup.helpers.FilestackUploader = FilestackUploader;

var FilestackRenderer = function () {
    
    return {
        getFileIdFromDirectLink: getFileIdFromDirectLink,
        createPreviewLinkFromDirectLink: createPreviewLinkFromDirectLink
    };
    

    function getFileIdFromDirectLink(fileUrl) {
        return fileUrl.match(/file\/(\w+)/)[1];
    }

    function createPreviewLinkFromDirectLink(directLinkUrl) {
        var fileId = getFileIdFromDirectLink(directLinkUrl);
        return 'https://www.filestackapi.com/api/preview/' + fileId;
    }

};

Partup.helpers.FilestackRenderer = FilestackRenderer;
