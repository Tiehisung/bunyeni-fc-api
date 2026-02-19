export enum DocServicesEnum {
  convertDoc = "convert-document",
  imageToText = "image-to-text",
  textToAudio = "text-to-audio",
  audioToText = "audio-to-text",
  formatting = "format-document",
  antiPiracyDetection = "anti-piracy-detection",
}
export enum ImageMimeTypes {
  JPEG = "image/jpeg",
  PNG = "image/png",
  GIF = "image/gif",
  BMP = "image/bmp",
  SVG = "image/svg+xml",
  WEBP = "image/webp",
}

export enum VideoMimeTypes {
  MP4 = "video/mp4",
  AVI = "video/x-msvideo",
}

export enum AudioMimeTypes {
  MP3 = "audio/mpeg",
  MP3_ALT = "audio/mp3",
  WAV = "audio/wav",
  OGG = "audio/ogg",
  AAC = "audio/aac",
  FLAC = "audio/flac",
  M4A = "audio/mp4",
  AMR = "audio/amr",
  WMA = "audio/x-ms-wma",
}

export enum DocMimeTypes {
  PDF = "application/pdf",
  DOC = "application/msword",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLS = "application/vnd.ms-excel",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPT = "application/vnd.ms-powerpoint",
  PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  TXT = "text/plain",
  CSV = "text/csv",
  ZIP = "application/zip",
  RAR = "application/vnd.rar",
  TAR = "application/x-tar",
  GZ = "application/gzip",
}

export const mimes = {
  image: Object.values(ImageMimeTypes).join(","),
  video: Object.values(VideoMimeTypes).join(","),
  audio: Object.values(AudioMimeTypes).join(","),
  document: Object.values(DocMimeTypes).join(","),
};
