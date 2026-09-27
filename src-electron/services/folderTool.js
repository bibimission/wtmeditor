const fs = require("fs");
const { readdir } = require("fs").promises;
const GIRLS_BASE_PATH = "packsGB";

const IMG_FORMATS = ['png', 'jpg', 'jpeg', 'gif']
const VIDEO_FORMATS = ['webm', 'mp4', 'webp']

import ImageTool from "./imageTool";

class FolderTool {
  constructor() {
    if (!fs.existsSync(GIRLS_BASE_PATH)) {
      fs.mkdirSync(GIRLS_BASE_PATH);
    }
  }

  // --------- GIRLS TOOLS

  async readGirlInfoFile(girlName) {
    var file = await this.readFile(
      GIRLS_BASE_PATH + "/" + girlName + "/mod_info.json"
    );
    var girlObject = JSON.parse(file);
    return girlObject;
  }

  createGirlFolder(girlName) {
    var url = GIRLS_BASE_PATH + "/" + girlName;
    try {
      if (!fs.existsSync(url)) {
        fs.mkdirSync(url);
        fs.mkdirSync(url + "/characters");
        fs.mkdirSync(url + "/event_cards");
        fs.mkdirSync(url + "/image_replacements");
        fs.mkdirSync(url + "/images");
        fs.mkdirSync(url + "/passives");
        fs.mkdirSync(url + "/videos");
        this.writeFile(GIRLS_BASE_PATH + "/" + girlName + "/mod_info.json", {});
        this.writeFile(GIRLS_BASE_PATH + "/" + girlName + "/videos/video_tags.json", []);
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async readGirlFolder(girlName) {
    var url = GIRLS_BASE_PATH + "/" + girlName;
    var infos = await this.readGirlInfoFile(girlName);
    var files = await this.readFolder(url);
    return JSON.stringify({ files, infos });
  }

  // --------- GENERAL TOOLS

  async readFolder(dirName) {
    let files = [];
    const items = await readdir(dirName, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        files.push({ url: `${dirName}/${item.name}`, type: 'folder' });
        files = [
          ...files,
          ...(await this.readFolder(`${dirName}/${item.name}`)),
        ];
      } else {
        if (item.name.split('.json').length > 1) {
          files.push({ url: `${dirName}/${item.name}`, content: fs.readFileSync(`${dirName}/${item.name}`).toString(), type: 'json', name: item.name })
        } else {
          if (VIDEO_FORMATS.includes(item.name.split('.')[1])) {
            files.push({ url: `${dirName}/${item.name}`, type: 'video', name: item.name });
          } else if (IMG_FORMATS.includes(item.name.split('.')[1])) {
            files.push({ url: `${dirName}/${item.name}`, type: 'image', name: item.name });
          }
        }
      }
    }
    return files;
  }

  async readFile(filePath) {
    return new Promise(async (resolve) => {
      try {
        if (filePath == null) {
          resolve("No Such FIle");
          return;
        }
        if (!fs.existsSync(filePath)) {
          this.writeFile(filePath, "");
        }
        fs.readFile(filePath, function (err, data) {
          if (!err) {
            var ret = Buffer.from(data);
            resolve(ret.toString());
          } else {
            resolve("error");
          }
        });
      } catch (err) {
        console.log(err);
        resolve("error");
      }
    });
  }

  writeFile(filePath, text, base64 = false) {
    if (base64) {
      text = new Buffer(text, "base64");
    }
    fs.writeFileSync(filePath, text, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }

  uploadFile(filePath, buffer) {
    fs.writeFileSync(filePath, Buffer.from(buffer), function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }

  renameFile(oldurl, newurl) {
    try {
      console.log("renamed " + oldurl + " into " + newurl);
      if (newurl.split(".").length == 1) {
        newurl += ".webp";
      }
      fs.rename(oldurl, newurl, function (e) {
        console.log(e);
      });
    } catch (e) {
      console.log(e);
    }
  }

  deleteFile(fileUrl) {
    try {
      fs.unlinkSync(fileUrl);
    } catch (e) {
      console.log(e)
    }
  }
}

export default FolderTool;
