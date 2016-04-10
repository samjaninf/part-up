Partup.helpers.pdfExtensions = ['.pdf'];
Partup.helpers.docExtensions = ['.doc', '.docx', '.rtf', '.pages', '.txt'];
Partup.helpers.presentationExtensions = ['.pps', '.ppsx', '.ppt', '.pptx'];
Partup.helpers.fallbackFileExtensions = ['.ai', '.bmp', '.eps', '.psd', '.tiff', '.tif', '.svg', '.key', '.keynote'];
Partup.helpers.imageExtensions = ['.gif', '.jpg', '.jpeg', '.png'];
Partup.helpers.spreadSheetExtensions = ['.xls', '.xlsx', '.numbers', '.csv'];



Partup.helpers.getExtensionFromFileName = function (fileName) {
    return fileName.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/)[0];
};

Partup.helpers.getSvgIcon = function(fileName) {
    var extension = Partup.helpers.getExtensionFromFileName(fileName);
    var svgFileName = 'file.svg';

    if (_.include(Partup.helpers.fallbackFileExtensions, extension)) {
        svgFileName = 'file.svg';
    }
    else if (_.include(Partup.helpers.presentationExtensions, extension)) {
        svgFileName = 'ppt.svg';
    }
    else if (_.include(Partup.helpers.docExtensions, extension)) {
        svgFileName = 'doc.svg';
    }
    else if (_.include(Partup.helpers.pdfExtensions, extension)) {
        svgFileName = 'pdf.svg';
    }
    else if (_.include(Partup.helpers.spreadSheetExtensions, extension)) {
        svgFileName = 'xls.svg';
    }

    return svgFileName;
};

// from http://scratch99.com/web-development/javascript/convert-bytes-to-mb-kb/
Partup.helpers.bytesToSize =  function(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};