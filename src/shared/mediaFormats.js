// What the game can display, and what the editor has to convert for it.
import { IMAGE_FORMATS, VIDEO_FORMATS } from "./gameData.generated.js";

// Accepted by the game, but Ren'Py only shows their first frame (BKinit_variables.rpy).
const POORLY_SUPPORTED = [".gif"];

// Ignored by the game, but readable by ffmpeg.
const IMAGES_TO_CONVERT = [".jfif", ".pjpeg", ".pjp", ".tif", ".tiff", ".tga"];
const VIDEOS_TO_CONVERT = [".mp4", ".m4v", ".mov", ".wmv", ".flv", ".3gp", ".ogv", ".mts"];

const IMAGES = [...IMAGE_FORMATS, ...IMAGES_TO_CONVERT];
const VIDEOS = [...VIDEO_FORMATS, ...VIDEOS_TO_CONVERT];

export const CONVERT_TO_VIDEO = "video";
export const CONVERT_TO_IMAGE = "image";

export function classify(extension) {
  const ext = extension.toLowerCase();
  if (IMAGES.includes(ext)) return "image";
  if (VIDEOS.includes(ext)) return "video";
  return null;
}

// Returns the kind of output a file needs, or null if the game reads it as it is.
// A .gif is sorted by frame count when it is converted.
export function conversionFor(extension) {
  const ext = extension.toLowerCase();
  if (VIDEOS_TO_CONVERT.includes(ext)) return CONVERT_TO_VIDEO;
  if (IMAGES_TO_CONVERT.includes(ext)) return CONVERT_TO_IMAGE;
  if (POORLY_SUPPORTED.includes(ext)) return CONVERT_TO_VIDEO;
  return null;
}
