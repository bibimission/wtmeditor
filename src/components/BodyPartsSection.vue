<template>
  <div class="flex row">
    <div class="mainPanel">
      <q-bar class="bg-primary">Bodypart images</q-bar>
      <div class="imgGrid">
        <div v-for="pic, index in tmpFiles" :key="index" @click="selectPic(index)" class="pic" :class="{ 'active': selectedPicIndex == index }">
          <CustomMedia :src="pic"></CustomMedia>
        </div>
        <q-file filled v-model="currentFileAdd" label="Add +" stack-label @update:model-value="addFile($event, 'bodypart')" />
      </div>
    </div>
    <div class="sidePanel">
      <q-select :options="bodypartOptions" label="bodypart" v-model="selectedBodyPart" @update:model-value="onChange"></q-select>
      <q-select :options="moodOptions" label="mood" v-model="selectedMood" @update:model-value="onChange"></q-select>
      <q-checkbox v-model="selectedHasCum" label="Cum covered" @change="onChange"></q-checkbox>
      <q-checkbox v-model="selectedIsCreampie" label="Cum inside" @change="onChange"></q-checkbox>
      <q-checkbox v-model="selectedHasButtPlug" label="Buttplug" @change="onChange" v-show="selectedBodyPart === 'ass'"></q-checkbox>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';

export default defineComponent({
  components: {
    CustomMedia
  },
  emits: ['change'],
  props: {
    photos: Array,
    folderPath: String
  },
  data: function () {
    return {
      tmpFiles: [],
      currentFileAdd: null,
      bodypartOptions: ['portrait', 'tportrait', 'face', 'boobs', 'pussy', 'ass', 'legs'],
      moodOptions: ['conservative', 'reserved', 'slut', 'whore', 'ultimate_whore'],
      selectedPicIndex: -1,
      selectedBodyPart: null,
      selectedMood: null,
      selectedHasCum: false,
      selectedIsCreampie: false,
      selectedHasButtPlug: false
    }
  },
  computed: {
    files() {
      return this.photos;
    }
  },
  methods: {
    async addFile(e, bodyPart, inFolder = true) {
      const file = this.currentFileAdd;
      const data = await file.arrayBuffer();
      var imgName = bodyPart + "" + this.photos.filter(p => p.split(bodyPart).length > 1).length + "." + file.name.split('.').slice(-1);
      window.ipcRenderer.send('img:upload', { path: "packs/" + this.folderPath + (inFolder ? '/bodyparts' : '') + '/' + imgName, buffer: data });
      this.$emit('change');
    },
    selectPic(index) {
      this.selectedPicIndex = index
      var tokens = this.tmpFiles[index].split('/').slice(-1)[0].split('_');
      this.selectedBodyPart = this.bodypartOptions.find(t => this.tmpFiles[index].split(t).length > 1);
      this.selectedMood = this.moodOptions.find(t => this.tmpFiles[index].split(t).length > 1);
      this.selectedHasCum = tokens.find(t => t == 'cum') != undefined;
      this.selectedIsCreampie = tokens.find(t => t == 'creampie') != undefined;
      this.selectedHasButtPlug = tokens.find(t => t == 'bp') != undefined;
    },
    onChange() {
      setTimeout(() => {
        var newFileName = this.tmpFiles[this.selectedPicIndex].split('/').slice(0, -1).join('/')
          + '/' + this.selectedBodyPart
          + (this.selectedMood == undefined ? '' : '_' + this.selectedMood)
          + (this.selectedHasCum ? '_cum' : '')
          + (this.selectedIsCreampie ? '_creampie' : '')
          + (this.selectedHasButtPlug ? '_bp' : '')
          + "_" + (Math.floor(Math.random() * 2000))
          + "." + this.tmpFiles[this.selectedPicIndex].split(".").slice(-1);
        window.ipcRenderer.send('img:rename', { oldPath: this.tmpFiles[this.selectedPicIndex], newPath: newFileName });
        this.tmpFiles[this.selectedPicIndex] = newFileName;
        this.$emit("change");
      }, 200);
    }
  },
  mounted() {
    this.tmpFiles = this.files
  },
  watch: {
    files(newV) {
      this.tmpFiles = newV
    }
  }
})
</script>
<style>
.wrong {
  outline: 3px red solid;
}

.imgGrid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
}

img {
  display: inline-block;
}

.pic {}

.pic.active {
  border: solid 3px lightblue;
}

.mainPanel {
  width: 75vw;
}

.sidePanel {
  width: 20vw;
  background-color: lightpink;
  height: 100%;
  color: black;
}
</style>