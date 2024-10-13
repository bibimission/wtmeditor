<template>
    <div>
        <q-btn color="blue" v-for="pts, index in coputePhotoShootsNames" :key="index" @click="selectPhotoshoot($event, pts)">
            {{ pts.split('/').slice(-1)[0] }}
        </q-btn>
    </div>
    <q-btn @click="resetIds" color="orange" v-if="currentPhotoshoot != ''">Reset Image Ids</q-btn>
    <div v-if="currentPhotoshoot != ''">
        <div class="col imgContainer" :class="{ 'reduced': photoInEdit != '' }">
            <div class="imgGrid">
                <img v-for="img, index in computeCurrentPhotos" :key="index" :src="img" @click="imageClick($event, img)" :class="{ 'wrong': !isGoodFormat(img), 'selected': photoInEdit == img, 'cover': img.split('cover').length > 1 }" @dragstart="dragStart" @drop="dropped" @dragenter="cancelDefault" @dragover="cancelDefault" :name="img">
            </div>
            <img ref="samplePhoto" :src="computeCurrentPhotos[0]" class="hidden">
        </div>
        <div class="col editPanel" :class="{ 'reduced': photoInEdit == '' }">
            <q-checkbox v-model="cover" label="Cover" color="teal" @update:model-value="onChange" />
            <q-select v-model="photoType" label="Photo Type" :options="photoTypes" @update:model-value="onChange"></q-select>
            <q-checkbox v-model="topless" label="Topless" color="teal" @update:model-value="onChange" />
            <q-checkbox v-model="bottomless" label="Bottomless" color="teal" @update:model-value="onChange" />
            <q-checkbox v-model="faceless" label="Faceless" color="teal" @update:model-value="onChange" />
            <q-checkbox v-model="closeup" label="Closeup" color="teal" @update:model-value="onChange" />
            <fieldset>
                <legend>Orientation : </legend>
                <q-option-group v-model="orientation" :options="orientations" color="primary" @update:model-value="onChange" />
            </fieldset>
        </div>
    </div>
    <div v-if="currentPhotoshoot != ''">
        <fieldset>
            <legend>Photoshot Info</legend>
            <q-input v-model="photoshootName" @change="onInfoChange" label="Name" />
            <q-input v-model="photoshootSource" @change="onInfoChange" label="Source" />
            <q-input v-model="photoshootModder" @change="onInfoChange" label="Modder" />
            <q-input v-model="photoshootCost" @change="onInfoChange" type="number" label="Cost" />
            <q-input v-model="photoshootDesc" @change="onInfoChange" label="Desc" />
            <q-select @update:model-value="onInfoChange" v-model="photoshootTraits" label="Traits (Optional)" multiple :options="photoshootTraitsOptions" use-input use-chips input-debounce="0"></q-select>
        </fieldset>
    </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        files: Array
    },
    emits: ['change'],
    data: function () {
        return {
            currentPhotoshoot: '',
            currentPhotos: [],
            photoInEdit: '',
            isConverting: false,

            draggedImg: '',

            photoshootName: '',
            photoshootTraits: [],
            photoshootSource: '',
            photoshootModder: '',
            photoshootCost: 0,
            photoshootDesc: '',

            photoshootTraitsOptions: [
                'indoor_private', 'indoor_public', 'outdoor_private', 'outdoor_public', 'studio',
                'real_estate', 'bath', 'shower', 'fruit', 'party', 'pool', 'lingerie', 'nature', 'bride',

                // Custom
                'close_up', 'creampie', 'internal_view', 'prolapse', 'gaping',
                'anal', 'gangbang', 'facial', 'deepthroat', 'dp'
            ],

            // In Edit
            cover: false,
            photoType: '',
            photoTypes: [
                { label: 'Clothed', value: 't0' },
                { label: 'Lacks upper/lower', value: 't1' },
                { label: 'Underwear/Swimsuit', value: 't2' },
                { label: 'Transparent/Sexy clothing', value: 't22' },
                { label: 'Nude', value: 't3' },
                { label: 'Softcore (Masturbation/Spreading...)', value: 't4' },
                { label: 'Sex', value: 't5' },
                { label: 'Hardcore', value: 't6' },
            ],
            topless: false,
            bottomless: false,
            faceless: false,
            closeup: false,
            orientation: 'hz',
            orientations: [
                { label: 'Horizontal', value: 'hz' },
                { label: 'Vertical', value: 'vz' }
            ],
            id: 0
        }
    },
    mounted: function () {
    },
    methods: {
        selectPhotoshoot(e, pts) {
            this.currentPhotoshoot = pts;
            window.ipcRenderer.invoke('file:read', { path: pts + "/photoshootConfig.ini" }).then((content) => {
                var lines = content.split("\n");
                lines.forEach(l => {
                    if (l.split("name =").length > 1) {
                        this.photoshootName = l.split("name")[1].trim().substring(1).trim();
                    }
                    if (l.split("traits =").length > 1) {
                        this.photoshootTraits = l.split("traits")[1].trim().substring(1).trim().split(',');
                    }
                    if (l.split("source =").length > 1) {
                        this.photoshootSource = l.split("source")[1].trim().substring(1).trim();
                    }
                    if (l.split("modder =").length > 1) {
                        this.photoshootModder = l.split("modder")[1].trim().substring(1).trim();
                    }
                    if (l.split("cost =").length > 1) {
                        this.photoshootCost = parseInt(l.split("cost")[1].trim().substring(1).trim(), 10);
                    }
                    if (l.split("desc =").length > 1) {
                        this.photoshootDesc = l.split("desc")[1].trim().substring(1).trim();
                    }
                });
            });
        },
        selectPhoto(img) {
            this.photoInEdit = img;
            var tokens = img.split("/").slice(-1)[0].split('.')[0].split("_");

            try {
                this.id = parseInt(tokens[0], 10);
                if (this.id > 1000) {
                    this.id = this.currentPhotos.indexOf(img);
                }
            } catch (e) {
                this.id = this.currentPhotos.indexOf(img);
            }
            this.topless = tokens.filter(f => f == 'tl').length > 0;
            this.bottomless = tokens.filter(f => f == 'bl').length > 0;
            this.faceless = tokens.filter(f => f == 'fl').length > 0;
            this.closeup = tokens.filter(f => f == 'cl').length > 0;
            this.cover = tokens.filter(f => f == 'cover').length > 0;

            this.orientation = tokens.filter(f => f == 'hz').length > 0 ? 'hz' : 'vz';
            var matchingType = this.photoTypes.find(t => tokens.includes(t.value));
            if (matchingType != -1) {
                this.photoType = matchingType;
            }
        },
        onChange() {
            if (this.photoInEdit != '') {
                var newName = this.photoInEdit.split("/").slice(0, -1).join("/") + "/";
                newName += this.id + "_"
                    + this.photoType?.value + "_"
                    + (this.cover ? 'cover_' : '')
                    + (this.topless ? 'tl_' : '')
                    + (this.bottomless ? 'bl_' : '')
                    + (this.faceless ? 'fl_' : '')
                    + (this.closeup ? 'cl_' : '')
                    + this.orientation + ".webp";
                this.currentPhotos[this.currentPhotos.indexOf(this.photoInEdit)] = newName;
                window.ipcRenderer.send('img:rename', { oldPath: this.photoInEdit, newPath: newName });
                this.photoInEdit = newName;
                this.$emit("change");
            }
        },
        onInfoChange() {
            var iniText = "[identity]\n";
            iniText += "name = " + this.photoshootName + "\n";
            iniText += "traits = " + this.photoshootTraits.join(", ") + "\n";
            iniText += "[info]\n";
            iniText += "source = " + this.photoshootSource + "\n";
            iniText += "modder = " + this.photoshootModder + "\n";

            iniText += "cost = " + this.photoshootCost + "\n";
            iniText += "desc = " + this.photoshootDesc + "\n";

            var samplePhoto = this.$refs.samplePhoto;
            var imgWidth = samplePhoto.naturalWidth;
            var imgHeight = samplePhoto.naturalHeight;

            if (imgWidth > imgHeight) {
                iniText += "horizontalRes = " + imgWidth + "," + imgHeight + "\n";
                iniText += "verticalRes = " + imgHeight + "," + imgWidth + "\n";
            } else {
                iniText += "horizontalRes = " + imgHeight + "," + imgWidth + "\n";
                iniText += "verticalRes = " + imgWidth + "," + imgHeight + "\n";
            }
            window.ipcRenderer.send('file:write', { path: this.currentPhotoshoot + "/photoshootConfig.ini", text: iniText })
        },
        imageClick(e, fp) {
            if (!this.isGoodFormat(fp)) {
                if (!this.isConverting) {
                    this.isConverting = true;
                    window.ipcRenderer.invoke('img:convert:webp', { img: fp }).then((newPath) => {
                        if (newPath) {
                            e.target.src = newPath;
                            e.target.classList.remove('wrong')
                        }
                        this.isConverting = false;
                    });
                }
            } else {
                this.selectPhoto(fp);
            }
        },
        isGoodFormat(fp) {
            return fp.split(".")[1] == "webp";
        },
        dragStart(e) {
            this.draggedImg = e.target.name;
        },
        dropped(e) {
            if (e.target.tagName == 'IMG') {
                var destImg = e.target.name;
                var dragId = this.draggedImg.split("/").slice(-1)[0].split("_")[0];
                var destId = destImg.split("/").slice(-1)[0].split("_")[0];
                var dargNewName = this.draggedImg.split("/").slice(0, -1).join("/") + "/" + destId + "_" + this.draggedImg.split("/").slice(-1)[0].split(dragId)[1];
                var destNewName = destImg.split("/").slice(0, -1).join("/") + "/" + dragId + "_" + destImg.split("/").slice(-1)[0].split(destId)[1];
                window.ipcRenderer.send('img:rename', { oldPath: this.draggedImg, newPath: dargNewName });
                window.ipcRenderer.send('img:rename', { oldPath: destImg, newPath: destNewName });

                // On inverse les images
                var newIndex = this.files.indexOf(this.draggedImg);
                var oldIndex = this.files.indexOf(destImg);
                this.files[newIndex] = dargNewName;
                this.files[oldIndex] = destNewName;

                this.$emit("change");
            }
            this.draggedImg = '';
        },
        cancelDefault(e) {
            e.preventDefault()
            e.stopPropagation()
            return false
        },
        resetIds() {
            this.computeCurrentPhotos.forEach((p, i) => {
                var newName = p.split("/").slice(0, -1).join("/") + "/" + i + "_" + p.split("/").slice(-1)[0].split("_").slice(1).filter(g => g != '').join("_");
                window.ipcRenderer.send('img:rename', { oldPath: p, newPath: newName });
            });
        }
    },
    computed: {
        coputePhotoShootsNames() {
            return this.files.filter(function (p) {
                if (p.includes("/photoshoots/")) {
                    return p.split("/photoshoots/")[1].split("/").length == 1;
                }
                return false;
            });
        },
        computeCurrentPhotos() {
            if (this.currentPhotoshoot != '') {
                var photos = this.files.filter(p => p.split(this.currentPhotoshoot).length > 1 && p != this.currentPhotoshoot && p.split(".")[1] != "ini")
                    .sort((a, b) => {
                        var tokensA = a.split("/").slice(-1)[0].split('.')[0].split("_");
                        var tokensB = b.split("/").slice(-1)[0].split('.')[0].split("_");
                        return parseInt(tokensA[0], 10) - parseInt(tokensB[0], 10);
                    })
                return photos;
            }
            return [];
        }
    }
})
</script>
<style scoped>
.col {
    display: inline-block;
    vertical-align: top;
}

.imgGrid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
}


.imgContainer.reduced {
    width: 80%
}

.imgContainer {
    width: 100%;
    transition: all ease 0.5s;
}

.editPanel {
    background-color: lightcoral;
    width: 20%;
    transform: scale(1);
    transition: all ease 0.5s;
    position: fixed;
    right: 0;
}

.editPanel.reduced {
    width: 0%;
    transform: scale(0);
}

img.selected {
    outline: solid 5px skyblue;
}

img.cover {
    border: solid 3px yellow;
}

[draggable="true"] {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
</style>