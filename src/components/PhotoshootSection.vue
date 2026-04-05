<template>
  <div>
    <ApiGirlSelector v-model="photoshootInfos.participant_ids" :permanent-girl="girl_id"></ApiGirlSelector>
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
    </div>
    <div class="col editPanel" :class="{ 'reduced': photoInEdit == '' }">

      <q-bar class="bg-primary">Main tags</q-bar>
      <q-checkbox v-model="cover" label="Cover" color="teal" @update:model-value="onChange" />
      <q-select v-model="photoType" label="Photo Type" :options="clothingLevelOptions" @update:model-value="onChange"></q-select>
      <q-checkbox v-model="topless" label="Topless" color="teal" @update:model-value="onChange" />
      <q-checkbox v-model="bottomless" label="Bottomless" color="teal" @update:model-value="onChange" />
      <q-checkbox v-model="faceless" label="Faceless" color="teal" @update:model-value="onChange" />
      <q-checkbox v-model="closeup" label="Closeup" color="teal" @update:model-value="onChange" />

      <PhotoshootActionPicker v-model="photoTags" @update:model-value="onChange" ref="actionPicker"></PhotoshootActionPicker>

      <q-bar class="bg-primary">Orientation</q-bar>
      <q-option-group v-model="orientation" :options="orientations" color="primary" @update:model-value="onChange" />
    </div>
  </div>
  <div v-if="currentPhotoshoot != ''">
    <fieldset>
      <legend>Photoshot Info</legend>
      <q-input v-model="photoshootInfos.name" @change="onInfoChange" label="Name" />
      <q-input v-model="photoshootInfos.display_name" @change="onInfoChange" label="Display Name" />
      <q-input v-model="photoshootInfos.modder" @change="onInfoChange" label="Modder" />
      <q-input v-model="photoshootInfos.cost" @change="onInfoChange" type="number" label="Cost" />
      <q-input v-model="photoshootInfos.description" @change="onInfoChange" label="Description (optionnal)" />
      <q-select v-model="photoshootInfos.shoot_subtype" @update:model-value="onInfoChange" label="Subtype" :options="lewdnessOptions"></q-select>
      <q-select @update:model-value="onInfoChange" v-model="photoshootInfos.tags" label="Tags" multiple :options="photoshootTraitsOptions" use-input use-chips input-debounce="0"></q-select>
    </fieldset>
  </div>
</template>
<script>
import ApiGirlSelector from './selectors/ApiGirlSelector.vue';
import { defineComponent } from 'vue'
import PhotoshootActionPicker from './selectors/PhotoshootActionPicker.vue';

export default defineComponent({
  components: { PhotoshootActionPicker, ApiGirlSelector },
  props: {
    files: Array,
    girl_id: String
  },
  emits: ['change'],
  data: function () {
    return {
      currentPhotoshoot: '',
      currentPhotos: [],
      photoInEdit: '',
      isConverting: false,

      draggedImg: '',
      photoshootInfos: {
        name: '',
        display_name: '',
        tags: [],
        modder: '',
        cost: 0,
        shoot_subtype: '',
        description: '',
        requirements: '', // On vire ça fait bugger
        requirement_description: '',
        participant_ids: []
      },

      lewdnessOptions: ['clothed', 'underwear', 'revealing', 'nude', 'softcore', 'lesbian', 'sex', 'hardcore', 'orgy', 'gangbang'],
      photoshootTraitsOptions: [
        {
          label: 'Location (1 max)',
          value: '',
          disable: true,
        },
        'photo_studio', 'indoor_private', 'indoor_public', 'outdoor_private', 'outdoor_public',
        {
          label: 'Traits',
          value: '',
          disable: true,
        },
        'lingerie', 'bikini', 'cosplay', 'bridal', 'sex_toy', 'massage', 'nature',
        'school', 'real_estate', 'office', 'workout', 'bdsm', 'party', 'bathroom',
        'bedroom', 'pool', 'beach', 'shower', 'bath'
      ],

      // In Edit
      cover: false,
      photoType: '',
      topless: false,
      bottomless: false,
      faceless: false,
      closeup: false,
      mainTags: [],
      photoTags: [],
      orientation: '',
      orientations: [
        { label: 'Horizontal', value: '' },
        { label: 'Vertical', value: 'vert' }
      ],
      id: 0,

      clothingLevelOptions: [
        { label: 'Clothed', value: 'clothed' },
        { label: 'Clothed Skimpy', value: 'half_dressed' },
        { label: 'Underwear/Bikini', value: 'underwear' },
        { label: 'Topless/Bottomless', value: 'revealing' },
        { label: 'Nude', value: 'bare' },
        { label: 'Softcore/Masturabating', value: 'softcore' },
        { label: 'Sex', value: 'sex' },
        { label: 'Hardcore', value: 'hardcore' }
      ]
    }
  },
  mounted: function () {
  },
  methods: {
    selectPhotoshoot(e, pts) {
      this.currentPhotoshoot = pts;
      window.ipcRenderer.invoke('file:read', { path: pts + "/photoshoot_config.json" }).then((content) => {
        this.photoshootInfos = JSON.parse(content);
        delete this.photoshootInfos.requirements
        delete this.photoshootInfos.requirement_description
        this.photoshootInfos.cost = parseInt(this.photoshootInfos.cost, 10)
      });
    },
    selectPhoto(img) {
      this.photoInEdit = img;
      var imgName = img.split("/").slice(-1)[0].split('.')[0]
      var imgParts = imgName.split('_').slice(1, 90).join('_').split('-')
      var mainTags = imgParts[0].split(',')
      var subTags = []
      if (imgParts.length > 1) {
        subTags = imgParts[1].split(',')
      }

      try {
        this.id = parseInt(imgName.split('_')[0], 10);
        if (this.id > 1000) {
          this.id = this.currentPhotos.indexOf(img);
        }
      } catch (e) {
        this.id = this.currentPhotos.indexOf(img);
      }
      this.topless = subTags.filter(f => f == 'notop').length > 0;
      this.bottomless = subTags.filter(f => f == 'nobot').length > 0;
      this.faceless = subTags.filter(f => f == 'noface').length > 0;
      this.closeup = subTags.filter(f => f == 'closeup').length > 0;
      this.cover = subTags.filter(f => f == 'cover').length > 0;

      this.photoTags = this.$refs.actionPicker.parse(subTags)

      // this.orientation = tokens.filter(f => f == 'vert').length > 0 ? 'vert' : '';
      console.log(subTags)
      this.photoType = this.clothingLevelOptions.find(c => c.value == mainTags[0])
    },
    onChange() {

      if (this.photoInEdit != '') {
        var newName = this.photoInEdit.split("/").slice(0, -1).join("/") + "/";
        console.log(this.photoTags)
        var tagList = []
        if (this.topless) {
          tagList.push('notop')
        }
        if (this.bottomless) {
          tagList.push('nobot')
        }
        if (this.faceless) {
          tagList.push('noface')
        }
        if (this.closeup) {
          tagList.push('closeup')
        }
        if (this.cover) {
          tagList.push('cover')
        }
        if (this.photoTags.length > 0) {
          tagList = tagList.concat(this.$tools.distinct(this.photoTags))
        }
        if (this.orientation === 'vert') {
          tagList.push('vert')
        }
        newName += this.id + "_" + this.photoType?.value + (tagList.length > 0 ? ('-' + tagList.join(',')) : '') + '.webp'
        this.currentPhotos[this.currentPhotos.indexOf(this.photoInEdit)] = newName;
        window.ipcRenderer.send('img:rename', { oldPath: this.photoInEdit, newPath: newName });
        this.photoInEdit = newName;
        console.log(newName)
        this.$emit("change");
      }
    },
    onInfoChange() {
      window.ipcRenderer.send('file:write', { path: this.currentPhotoshoot + "/photoshoot_config.json", text: JSON.stringify(this.photoshootInfos) })
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
        if (e.target.width < e.target.height) {
          this.orientation = 'vert'
        } else {
          this.orientation = ''
        }
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
        var photos = this.files.filter(p => p.split(this.currentPhotoshoot).length > 1 && p != this.currentPhotoshoot && p.split(".")[1] != "ini" && p.split(".")[1] != "json")
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
  z-index: 5000;
}

.editPanel.reduced {
  width: 0%;
  transform: scale(0);
}

img {
  display: block;
  transition: all ease 0.2s;
}

img.selected {
  outline: solid 5px skyblue;
  transform: scale(1.2);
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