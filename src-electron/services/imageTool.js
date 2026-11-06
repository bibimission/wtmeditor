// Media conversion, common to every editor: it knows nothing about a particular game.
// Each method writes a new file in outDir and never touches the source.
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobe from "@ffprobe-installer/ffprobe";
import webpBinary from "webp-converter/src/cwebp.js";

const run = util.promisify(execFile);
const RUN_OPTIONS = { maxBuffer: 64 * 1024 * 1024, windowsHide: true };
const IMAGE_QUALITY = "80";
const DEFAULT_FRAME_MS = 100;

const WEBP_TOOLS = path.dirname(webpBinary());
const webpTool = (name) => path.join(WEBP_TOOLS, process.platform === "win32" ? `${name}.exe` : name);

// libvpx needs even dimensions with yuv420p.
const EVEN_SIZE = "scale=trunc(iw/2)*2:trunc(ih/2)*2";
const WEBM_OPTIONS = [
  "-an",
  "-vf", EVEN_SIZE,
  "-c:v", "libvpx-vp9",
  "-pix_fmt", "yuv420p",
  "-crf", "30",
  "-b:v", "0",
  "-row-mt", "1",
  "-cpu-used", "4",
];

class ImageTool {
  static async ffmpeg(args) {
    await run(ffmpegInstaller.path, ["-hide_banner", "-loglevel", "error", "-y", ...args], RUN_OPTIONS);
  }

  // Reads the WebP header: bit 1 of the VP8X flags marks an animation.
  static isAnimatedWebp(file) {
    const header = Buffer.alloc(21);
    const descriptor = fs.openSync(file, "r");
    try {
      fs.readSync(descriptor, header, 0, 21, 0);
    } finally {
      fs.closeSync(descriptor);
    }
    return (
      header.toString("latin1", 0, 4) === "RIFF" &&
      header.toString("latin1", 8, 16) === "WEBPVP8X" &&
      (header[20] & 0x02) !== 0
    );
  }

  static async frameCount(file) {
    const { stdout } = await run(
      ffprobe.path,
      ["-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", file],
      RUN_OPTIONS
    );
    return parseInt(stdout.trim(), 10) || 0;
  }

  // Throws unless the file holds a readable picture stream.
  static async verify(file) {
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      throw new Error("The conversion produced no file");
    }
    const { stdout } = await run(
      ffprobe.path,
      ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file],
      RUN_OPTIONS
    );
    const [width] = stdout.trim().split(",").map(Number);
    if (!width) throw new Error("The converted file is not readable");
  }

  static async toWebp(source, outDir) {
    const output = path.join(outDir, "output.webp");
    await this.ffmpeg(["-i", source, "-frames:v", "1", "-c:v", "libwebp", "-q:v", IMAGE_QUALITY, output]);
    await this.verify(output);
    return output;
  }

  static async toWebm(source, outDir) {
    const output = path.join(outDir, "output.webm");
    await this.ffmpeg(["-i", source, ...WEBM_OPTIONS, output]);
    await this.verify(output);
    return output;
  }

  static async animatedWebpFrameMs(source) {
    const { stdout } = await run(webpTool("webpmux"), ["-info", source], RUN_OPTIONS);
    const durations = stdout
      .split(/\r?\n/)
      .filter((line) => /^\s*\d+:/.test(line))
      .map((line) => Number(line.trim().split(/\s+/)[6]))
      .filter((duration) => duration > 0);
    if (durations.length === 0) return DEFAULT_FRAME_MS;
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  }

  static async animatedWebpToWebm(source, outDir) {
    const frames = path.join(outDir, "frames");
    fs.mkdirSync(frames);
    await run(webpTool("anim_dump"), ["-folder", frames, "-prefix", "frame_", source], RUN_OPTIONS);

    const frameRate = Math.min(60, Math.max(1, 1000 / (await this.animatedWebpFrameMs(source))));
    const output = path.join(outDir, "output.webm");
    const pattern = path.join(frames, "frame_%04d.png");
    await this.ffmpeg(["-framerate", frameRate.toFixed(3), "-i", pattern, ...WEBM_OPTIONS, output]);
    await this.verify(output);
    return output;
  }
}

export default ImageTool;
