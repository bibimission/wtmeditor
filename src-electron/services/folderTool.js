const fs = require("fs");
const { readdir } = require("fs").promises;
const GIRLS_BASE_PATH = "packs";

import ImageTool from "./imageTool";

class FolderTool {
  constructor() {
    if (!fs.existsSync(GIRLS_BASE_PATH)) {
      fs.mkdirSync(GIRLS_BASE_PATH);
    }
  }

  // --------- GIRLS TOOLS

  writeGirlInfoFile(girlName, girlObject) {
    if (girlName != "") {
      this.writeFile(
        GIRLS_BASE_PATH + "/" + girlName + "/girl_config.json",
        girlObject
      );
    }
  }
  async readGirlInfoFile(girlName) {
    var file = await this.readFile(
      GIRLS_BASE_PATH + "/" + girlName + "/girl_config.json"
    );
    var girlObject = JSON.parse(file);
    return girlObject;
  }

  createGirlFolder(girlName) {
    var url = GIRLS_BASE_PATH + "/" + girlName;
    try {
      if (!fs.existsSync(url)) {
        fs.mkdirSync(url);
        fs.mkdirSync(url + "/body_images");
        fs.mkdirSync(url + "/events");
        fs.mkdirSync(url + "/photoshoots");
        fs.mkdirSync(url + "/fullbody");
        fs.mkdirSync(url + "/clothing");
        fs.mkdirSync(url + "/vids");
        this.writeGirlInfoFile(girlName, {});
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
        files.push(`${dirName}/${item.name}`);
        files = [
          ...files,
          ...(await this.readFolder(`${dirName}/${item.name}`)),
        ];
      } else {
        files.push(`${dirName}/${item.name}`);
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

  writeFile(filePath, text) {
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
}

export default FolderTool;
