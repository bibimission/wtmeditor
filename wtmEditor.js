const pathInput = document.getElementById("folderInput");
var files = [];
var photoInEdit = null;
var currentPhotoshootTab = "";
document.getElementById("loadButt").onclick = function(){
	var lePath = pathInput.value;
	getFiles(lePath, function(data){
		console.log(data);
		files = data.files;
		document.getElementById("menu").classList.remove("hidden");
		document.getElementById("content").classList.remove("hidden");
	});
};
document.getElementById("createButt").onclick = function(){
	var lePath = pathInput.value;
	createFolder(lePath, function(data){
		console.log(data);
	});
};

document.getElementById("photoSaveBtn").onclick = savePhotoInformation;
document.getElementById("photoCancelBtn").onclick = closeModal;
document.getElementById("photoShootSaveBtn").onclick = savePhotoshootInfo;

document.getElementById("closeHelpButt").onclick = function(){
	showHelpModal(false);
};
document.getElementById("helpbutt").onclick = function(){
	showHelpModal(true);
};

/*
sendPostRequest("convertGif", "masturb.gif", function(d){
	console.log(d);
});
*/



document.getElementById("girlButt").onclick=function(){
	displayGirlInfoSection();
};
document.getElementById("bodyButt").onclick=function(){
	displayBodypartsSection();
};
document.getElementById("eventButt").onclick=function(){
	displayEventSection();
};
document.getElementById("photoButt").onclick=function(){
	displayPhotoshootSection();
};
document.getElementById("vidsButt").onclick=function(){
	displayVidsSection();
};

showFrame("GirlInfoSection");


document.getElementById("saveGirl").onclick = function(){
	var iniText = "[identity]\n";
	iniText += "first_name = " + document.getElementById("first_name").value+"\n";
	iniText += "last_name = " + document.getElementById("last_name").value+"\n";
	iniText += "traits = " + document.getElementById("traits").value+"\n";
	iniText += "[info]\n";
	iniText += "source = " + document.getElementById("source").value+"\n";
	iniText += "modder = " + document.getElementById("modder_name").value+"\n";
	iniText += "[vars]\n";
	iniText += "sensitiveArea = " + document.getElementById("sensitive_area").value+"\n";
	setFile(pathInput.value + "/girlConfig.ini", iniText,function(d){
		console.log(d);
	});
};


// Specific pages

function displayGirlInfoSection(){
	showFrame("GirlInfoSection");
	if(pathInput.value){
		getFile(pathInput.value+"/girlConfig.ini", function(d){
			if(d.success){
				var lines = d.file.split("\n");
				lines.forEach(function(l){
					if(l.split("first_name").length > 1){
						document.getElementById("first_name").value = l.split("first_name")[1].trim().substring(1).trim();
					}
					if(l.split("last_name").length > 1){
						document.getElementById("last_name").value = l.split("last_name")[1].trim().substring(1).trim();
					}
					if(l.split("traits").length > 1){
						document.getElementById("traits").value = l.split("traits")[1].trim().substring(1).trim();
					}
					if(l.split("source").length > 1){
						document.getElementById("source").value = l.split("source")[1].trim().substring(1).trim();
					}
					if(l.split("modder").length > 1){
						document.getElementById("modder_name").value = l.split("modder")[1].trim().substring(1).trim();
					}
					if(l.split("sensitiveArea").length > 1){
						document.getElementById("sensitive_area").value = l.split("sensitiveArea")[1].trim().substring(1).trim();
					}
				});
			}
		});
	}
}


function displayBodypartsSection(){
	showFrame("BodyPartsSection");
	
	var facePics = files.filter(p => p.split(pathInput.value+"/")[1].includes("face"));
	var faceImgDiv = document.getElementById("facePics");
	faceImgDiv.innerHTML = "";
	facePics.forEach(function(fp){
		var imgEl = document.createElement("img");
		imgEl.src = fp;
		if(fp.split(".")[1] != "webp"){
			imgEl.classList.add("invalid");
			imgEl.onclick = function(){
				convertToWebp(fp, function(d){
					imgEl.classList.remove("invalid");
					imgEl.src = fp.split(".")[0]+".webp";
				});
			};
		}
		faceImgDiv.appendChild(imgEl);
	});
	
	displayBodypartImgGrid("boobs");
	displayBodypartImgGrid("pussy");
	displayBodypartImgGrid("ass");
}
function displayBodypartImgGrid(bodypart){
	var assImgDiv = document.getElementById(bodypart+"Pics");
	var assPics = files.filter(function(p){
		if(p.split("/bodyparts/").length > 1){
			return p.split("/bodyparts/")[1].includes(bodypart);
		}
		return false;
	});
	assImgDiv.innerHTML = "";
	assPics.forEach(function(fp){
		var imgEl = document.createElement("img");
		imgEl.src = fp;
		if(fp.split(".")[1] != "webp"){
			imgEl.classList.add("invalid");
			imgEl.onclick = function(){
				convertToWebp(fp, function(d){
					imgEl.classList.remove("invalid");
					imgEl.src = fp.split(".")[0]+".webp";
				});
			};
		}
		assImgDiv.appendChild(imgEl);
	});
}

function displayVidsSection(){
	showFrame("VidsSection");
	var vidz = files.filter(p=> p.split("/vids/").length > 1);
	var vidsDiv = document.getElementById("vidzDiv");
	vidsDiv.innerHTML = "";
	vidz.forEach(function(fp){
		if(fp.split(".")[1] != "webm"){
			var gifEl = document.createElement('img');
			gifEl.classList.add("invalid");
			gifEl.src = fp;
			gifEl.onclick = function(){
				convertToWebm(fp, function(d){
					gifEl.classList.add("hidden");
					var vidEl = document.createElement("video");
					vidEl.autoplay = true;
					vidEl.loop = true;
					vidEl.src = fp.split(".")[0]+".webm";
					vidsDiv.appendChild(vidEl);
				});
			};
			vidsDiv.appendChild(gifEl);
		}else{
			var imgEl = document.createElement("video");
			imgEl.autoplay = true;
			imgEl.loop = true;
			imgEl.src = fp;
			vidsDiv.appendChild(imgEl);
		}
	});
}

function displayPhotoshootSection(){
	showFrame("PhotoshotsSection");
	var photoshootFolders = files.filter(function(p){
		if(p.includes("/photoshoots/")){
			return p.split("/photoshoots/")[1].split("/").length == 1;
		}
		return false;
	});
	var displayDiv = document.getElementById("photoshootview");
	displayDiv.innerHTML = "";
	photoshootFolders.forEach(function(pts){
		var photoshootDiv = document.createElement("div");
		photoshootDiv.id = pts.split("/").slice(-1) + "_tab";
		photoshootDiv.classList.add("imgGrid");
		photoshootDiv.classList.add("photoTab");
		photoshootDiv.classList.add("hidden");
		var photos = files.filter(p => p.split(pts).length > 1 && p != pts && p.split(".")[1] != "ini");
		photos.forEach(function(fp,i){
			var imgEl = document.createElement("img");
			imgEl.src = fp;
			if(fp.split(".")[1] != "webp"){
				imgEl.classList.add("invalid");
			}
			imgEl.onclick = function(){
				photoInEdit = this;
				editPhotoshootPic(fp,i);
			};
			photoshootDiv.appendChild(imgEl);
		});
		displayDiv.appendChild(photoshootDiv);
	});
	
	var toolbar = document.getElementById("photoshootChoose");
	toolbar.innerHTML = "";
	photoshootFolders.forEach(function(f){
		var tabButt = document.createElement("div");
		tabButt.classList.add("tabButton");
		tabButt.innerHTML = f.split("/").slice(-1);
		tabButt.onclick = function(){
			document.getElementById("photoshootForm").classList.remove("hidden");
			var photoTabs = document.getElementsByClassName("photoTab");
			for(var t of photoTabs){
				t.classList.add("hidden");
			}
			currentPhotoshootTab = f.split("/").slice(-1);
			document.getElementById(currentPhotoshootTab + "_tab").classList.remove("hidden");
			getFile(pathInput.value+"/photoshoots/"+currentPhotoshootTab+"/photoshootConfig.ini", function(d){
				if(d.success){
					var lines = d.file.split("\n");
					lines.forEach(function(l){
						if(l.split("name").length > 1){
							document.getElementById("photoShootName").value = l.split("name")[1].trim().substring(1).trim();
						}
						if(l.split("desc").length > 1){
							document.getElementById("photoShootDesc").value = l.split("desc")[1].trim().substring(1).trim();
						}
						if(l.split("traits").length > 1){
							document.getElementById("photoShootTraits").value = l.split("traits")[1].trim().substring(1).trim();
						}
						if(l.split("source").length > 1){
							document.getElementById("photoShootSource").value = l.split("source")[1].trim().substring(1).trim();
						}
						if(l.split("modder").length > 1){
							document.getElementById("photoShootModder").value = l.split("modder")[1].trim().substring(1).trim();
						}
						if(l.split("cost").length > 1){
							document.getElementById("photoShootCost").value = l.split("cost")[1].trim().substring(1).trim();
						}
					});
				}
			});
		};
		toolbar.appendChild(tabButt);
	});
}

function savePhotoshootInfo(){
	var iniText = "[identity]\n";
	iniText += "name = " + document.getElementById("photoShootName").value+"\n";
	iniText += "traits = " + document.getElementById("photoShootTraits").value+"\n";
	iniText += "[info]\n";
	iniText += "source = " + document.getElementById("photoShootSource").value+"\n";
	iniText += "modder = " + document.getElementById("photoShootModder").value+"\n";
	
	iniText += "cost = " + document.getElementById("photoShootCost").value+"\n";
	iniText += "desc = " + document.getElementById("photoShootDesc").value+"\n";
	
	var currentTab = document.getElementById(currentPhotoshootTab+"_tab");
	var imgWidth = currentTab.children[0].naturalWidth;
	var imgHeight = currentTab.children[0].naturalHeight;
	
	if(imgWidth > imgHeight){
		iniText += "horizontalRes = " + imgWidth+","+imgHeight+"\n";
		iniText += "verticalRes = " + imgHeight+","+imgWidth+"\n";
	}else{
		iniText += "horizontalRes = " + imgHeight+","+imgWidth+"\n";
		iniText += "verticalRes = " + imgWidth+","+imgHeight+"\n";
	}
	setFile(pathInput.value+"/photoshoots/"+currentPhotoshootTab+"/photoshootConfig.ini", iniText,function(d){
		console.log(d);
	});
}

function editPhotoshootPic(imgPath,index){
	
	var imgEl = document.getElementById("imgPreview");
	imgEl.onload = function(){
		if(this.width > this.height){
			document.getElementById("hz").checked = true;
		}else{
			document.getElementById("vz").checked = true;
		}
	};
	imgEl.src = imgPath;
	
	if(imgPath.split(".")[1] != "webp"){
		imgEl.classList.add("invalid");
		imgEl.onclick = function(){
			convertToWebp(imgPath, function(d){
				imgEl.classList.remove("invalid");
				imgEl.src = imgPath.split(".")[0]+".webp";
				photoInEdit.src = imgPath.split(".")[0]+".webp";
				photoInEdit.classList.remove("invalid");
			});
		};
	}
	
	var tokens = imgPath.split("/");
	var imgName = tokens[tokens.length -1].split(".")[0];
	document.getElementById("modalTitle").innerHTML = "Editing "+imgName;
	document.getElementById("photoName").value = imgPath;
	
	var tags = imgName.split("_");
	if(tags.length > 1){
		if(parseInt(tags[0],10) < 200){
			index = parseInt(tags[0],10);
		}
		
		document.getElementById("checktl").checked = tags.filter(t=>t == "tl").length > 0;
		document.getElementById("checkfl").checked = tags.filter(t=>t == "fl").length > 0;
		document.getElementById("checkbl").checked = tags.filter(t=>t == "bl").length > 0;
		document.getElementById("checkcl").checked = tags.filter(t=>t == "cl").length > 0;
		document.getElementById("checkco").checked = tags.filter(t=>t == "cover").length > 0;
		
		var options = document.getElementById("phototype").options;
		for(var opt of options){
			if(tags.filter(t=>t == opt.value).length > 0){
				document.getElementById("phototype").value = opt.value;
			}
		}
	}
	
	document.getElementById("photoNumber").value = index+"";
	
	document.getElementById("overlay").classList.remove("hidden");
	document.getElementById("photoshootEditModal").classList.remove("hidden");
}

function getCurrentModalPhotoName(){
	var ret = "";
	ret += "_" + document.getElementById("phototype").value;
	ret += document.getElementById("checktl").checked ? "_tl": "";
	ret += document.getElementById("checkfl").checked ? "_fl": "";
	ret += document.getElementById("checkbl").checked ? "_bl": "";
	ret += document.getElementById("checkcl").checked ? "_cl": "";
	ret += document.getElementById("checkco").checked ? "_cover": "";
	
	ret += document.getElementById("vz").checked ? "_vz": "";
	ret += document.getElementById("hz").checked ? "_hz": "";
	return ret;
}

function savePhotoInformation(){
	var photoPath = document.getElementById("photoName").value;
	var tokens = photoPath.split("/");
	var imgName = tokens[tokens.length -1];
	var number = document.getElementById("photoNumber").value;
	var finalImgName = number+getCurrentModalPhotoName()+"."+imgName.split(".")[1];
	var finalPath = tokens.slice(0,-1).join("/")+"/"+finalImgName;
	
	renameFile(photoPath, finalPath, function(){
		photoInEdit.src = finalPath;
		photoInEdit.onclick = function(){
			photoInEdit = this;
			editPhotoshootPic(finalPath,number);
		};
		photoInEdit = null;
	});
	closeModal();
}

function displayEventSection(){
	showFrame("EventsSection");
}

function closeModal(){
	
	document.getElementById("overlay").classList.add("hidden");
	document.getElementById("photoshootEditModal").classList.add("hidden");
}

function showHelpModal(showit){
	if(showit){
		document.getElementById("overlay").classList.remove("hidden");
		document.getElementById("helpModal").classList.remove("hidden");
	}else{
		document.getElementById("overlay").classList.add("hidden");
		document.getElementById("helpModal").classList.add("hidden");
	}
}

function showFrame(frameName){
	var frames = document.getElementsByClassName("frame");
	for(var f of frames){
		f.classList.add("hidden");
	}
	document.getElementById(frameName).classList.remove("hidden");
}

function renameFile(path, newpath, callback){
	sendPostRequest("renameFile/"+ codeUrl(path)+"/"+codeUrl(newpath),'', callback);
}

function convertToWebp(path, callback){
	sendPostRequest("convertToWebp/"+ codeUrl(path),'', callback);
}
function convertToWebm(path, callback){
	sendPostRequest("convertToWebm/"+ codeUrl(path),'', callback);
}

function getFiles(path, callback){
	sendPostRequest("readFolder/"+ codeUrl(path),'', callback);
}

function getFile(path, callback){
	sendGetRequest("getFile/" +codeUrl(path), callback);
}
function setFile(path, text, callback){
	sendPostRequest("setFile/" +codeUrl(path),text, callback);
}

function createFolder(path, callback){
	sendGetRequest("createFolder/"+codeUrl(path), callback);
}

function sendPostRequest(url, parameter, callback){
	var myRequest = new XMLHttpRequest();
	myRequest.open('POST', '/'+url);
	myRequest.setRequestHeader("Content-Type", "application/json");
	myRequest.onreadystatechange = function () { 
		if (myRequest.readyState === 4) {
			var json = JSON.parse(myRequest.responseText);
			callback(json);
		}
	};
	if(parameter){
		myRequest.send(JSON.stringify({data: parameter}));
	}else{
		myRequest.send();
	}
	
}

function sendGetRequest(url,callback){
	var myRequest = new XMLHttpRequest();
	myRequest.open('GET', url);
	myRequest.onreadystatechange = function () { 
		if (myRequest.readyState === 4) {
			var json = JSON.parse(myRequest.responseText);
			callback(json);
		}
	};
	myRequest.send();
}


function codeUrl(url){
	return url.split("/").join("§");
}