
// Gif to WEBM library
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const webp=require('webp-converter');
webp.grant_permission();

const ffmpeg = require("fluent-ffmpeg")()
  .setFfprobePath(ffprobe.path)
  .setFfmpegPath(ffmpegInstaller.path);

const fs = require('fs')
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');

const { readdir } = require('fs').promises;


//Folders
var folders = ["bodyparts","events","photoshoots","vids"];

// INTERFACE WEB
var express = require('express');
var app = express(),

server = require('http').createServer(app);
app.use(express.static(__dirname));
app.use(bodyParser.json({limit: '50mb'}));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});


app.post('/readFolder/:path',function(req,res){
	var url = parseUrl(req.params.path);
	try {
		var ret = [];
		if (fs.existsSync(url)){
			
			getFileList(url).then((files) => {
				res.json({ success : true, files : files});
			});
			
		}else{
			res.json({ success : false});
		}
	} catch (err) {
		res.json({ success : false});
	}
});

app.post('/convertToWebm/:path',function(req,res){
	var url = parseUrl(req.params.path);
	console.log("Converting "+url+" to WEBM");
	try {
		convertGifToWebm(url, function(){
			res.json({ success : true });
		});
	} catch (err) {
		console.log(err);
		res.json({ success : false});
	}
});

app.post('/convertToWebp/:path',function(req,res){
	var url = parseUrl(req.params.path);
	var resUrl = url.split(".")[0]+".webp";
	const result = webp.cwebp(url,resUrl,"-q 80",logging="-v");
	result.then((response) => {
		res.json({ success : true });
		fs.unlinkSync(url);
	  console.log(response);
	});
});

app.post('/renameFile/:oldpath/:newpath',function(req,res){
	var oldurl = parseUrl(req.params.oldpath);
	var newurl = parseUrl(req.params.newpath);
	fs.rename( oldurl, newurl, function(){
		res.json({ success : true });
	});
});

app.get('/createFolder/:path',function(req,res){
	var url = parseUrl(req.params.path);
	try {
		if (!fs.existsSync(url)){
			fs.mkdirSync(url);
			fs.mkdirSync(url+"/bodyparts");
			fs.mkdirSync(url+"/events");
			fs.mkdirSync(url+"/photoshoots");
			fs.mkdirSync(url+"/vids");
		}
		res.json({ success : true });
	} catch (err) {
		console.log(err);
		res.json({ success : false});
	}
});

app.get('/getFile/:path',function(req,res){
	var url = parseUrl(req.params.path);
	try {
		readFile(url, function(d){
			res.json({ success : true, file : d });
		});
		
	} catch (err) {
		console.log(err);
		res.json({ success : false});
	}
});
app.post('/setFile/:path',function(req,res){
	var url = parseUrl(req.params.path);
	try {
		console.log(req.body.data);
		var newText = req.body.data;
		writeFile(url, newText, function(){
			res.json({ success : true });
		});
	} catch (err) {
		console.log(err);
		res.json({ success : false});
	}
});

function convertGifToWebm(imagePath, callback){
	ffmpeg
    .input(imagePath)
    .noAudio()
    .outputOptions('-pix_fmt yuv420p')
    .output(imagePath.substring(0,imagePath.length - 3) + "webm")
    .on("end", () => {
      console.log("Generated !");
	  fs.unlinkSync(imagePath);
	  callback();
    })
    .on("error", (e) => console.log(e))
    .run();
}

function readFile(filePath, callback){
	fs.readFile(filePath, function(err,data){
		if (!err) {
			var ret = Buffer.from(data);
			callback(ret.toString());
		} else {
			console.log(err);
		}
	});
}
function writeFile(filePath,text, callback){
	fs.writeFileSync(filePath, text, function(err) {
    if(err) {
        return console.log(err);
    }
    callback();
}); 
}

const getFileList = async (dirName) => {
    let files = [];
    const items = await readdir(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
			files.push(`${dirName}/${item.name}`);
            files = [
                ...files,
                ...(await getFileList(`${dirName}/${item.name}`)),
            ];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }

    return files;
};


function parseUrl(url){
	return url.split("§").join("/");
}

server.listen(8080);