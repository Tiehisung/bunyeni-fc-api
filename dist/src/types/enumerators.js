"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mimes = exports.DocMimeTypes = exports.AudioMimeTypes = exports.VideoMimeTypes = exports.ImageMimeTypes = exports.DocServicesEnum = void 0;
var DocServicesEnum;
(function (DocServicesEnum) {
    DocServicesEnum["convertDoc"] = "convert-document";
    DocServicesEnum["imageToText"] = "image-to-text";
    DocServicesEnum["textToAudio"] = "text-to-audio";
    DocServicesEnum["audioToText"] = "audio-to-text";
    DocServicesEnum["formatting"] = "format-document";
    DocServicesEnum["antiPiracyDetection"] = "anti-piracy-detection";
})(DocServicesEnum || (exports.DocServicesEnum = DocServicesEnum = {}));
var ImageMimeTypes;
(function (ImageMimeTypes) {
    ImageMimeTypes["JPEG"] = "image/jpeg";
    ImageMimeTypes["PNG"] = "image/png";
    ImageMimeTypes["GIF"] = "image/gif";
    ImageMimeTypes["BMP"] = "image/bmp";
    ImageMimeTypes["SVG"] = "image/svg+xml";
    ImageMimeTypes["WEBP"] = "image/webp";
})(ImageMimeTypes || (exports.ImageMimeTypes = ImageMimeTypes = {}));
var VideoMimeTypes;
(function (VideoMimeTypes) {
    VideoMimeTypes["MP4"] = "video/mp4";
    VideoMimeTypes["AVI"] = "video/x-msvideo";
})(VideoMimeTypes || (exports.VideoMimeTypes = VideoMimeTypes = {}));
var AudioMimeTypes;
(function (AudioMimeTypes) {
    AudioMimeTypes["MP3"] = "audio/mpeg";
    AudioMimeTypes["MP3_ALT"] = "audio/mp3";
    AudioMimeTypes["WAV"] = "audio/wav";
    AudioMimeTypes["OGG"] = "audio/ogg";
    AudioMimeTypes["AAC"] = "audio/aac";
    AudioMimeTypes["FLAC"] = "audio/flac";
    AudioMimeTypes["M4A"] = "audio/mp4";
    AudioMimeTypes["AMR"] = "audio/amr";
    AudioMimeTypes["WMA"] = "audio/x-ms-wma";
})(AudioMimeTypes || (exports.AudioMimeTypes = AudioMimeTypes = {}));
var DocMimeTypes;
(function (DocMimeTypes) {
    DocMimeTypes["PDF"] = "application/pdf";
    DocMimeTypes["DOC"] = "application/msword";
    DocMimeTypes["DOCX"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    DocMimeTypes["XLS"] = "application/vnd.ms-excel";
    DocMimeTypes["XLSX"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    DocMimeTypes["PPT"] = "application/vnd.ms-powerpoint";
    DocMimeTypes["PPTX"] = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    DocMimeTypes["TXT"] = "text/plain";
    DocMimeTypes["CSV"] = "text/csv";
    DocMimeTypes["ZIP"] = "application/zip";
    DocMimeTypes["RAR"] = "application/vnd.rar";
    DocMimeTypes["TAR"] = "application/x-tar";
    DocMimeTypes["GZ"] = "application/gzip";
})(DocMimeTypes || (exports.DocMimeTypes = DocMimeTypes = {}));
exports.mimes = {
    image: Object.values(ImageMimeTypes).join(","),
    video: Object.values(VideoMimeTypes).join(","),
    audio: Object.values(AudioMimeTypes).join(","),
    document: Object.values(DocMimeTypes).join(","),
};
