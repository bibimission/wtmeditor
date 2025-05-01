<template>
  <div>
    <div class="pageBody">
      <div class="col editPanel">
        <ClothingPicker v-model="videoClothing" ref="clothesPicker" @stripAction="onStrip" @update:model-value="onChange"></ClothingPicker>
      </div>
      <div v-if="computeVideos.length > 0" class="col mediaPlayer">
        <CustomMedia :src="computeVideos[videoInEdit]" :forceVideo="true"></CustomMedia>
        <div class="title">{{ videoMainAction }}</div>
        <div class="title">{{ videoName }}</div>
        <div class="navBar">
          <q-btn color="orange" glossy @click="changeIndex(-1)">Prec.</q-btn>
          <span>{{ videoInEdit + '/' + computeVideos.length }}</span>
          <q-btn color="orange" glossy @click="changeIndex(1)">Next.</q-btn>
        </div>
      </div>
      <div class="col editPanel">
        <VideoActionPicker v-model="videoActions" ref="actionPicker" @update:model-value="onActionChange"></VideoActionPicker>
      </div>
    </div>

  </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';
import VideoActionPicker from './selectors/VideoActionPicker.vue';
import ClothingPicker from './selectors/ClothingPicker.vue';

export default defineComponent({
  components: {
    CustomMedia,
    VideoActionPicker,
    ClothingPicker
  },
  props: {
    videos: Array
  },
  emits: ['change'],
  data: function () {
    return {
      actualVideos: [],
      videoInEdit: 0,
      videoName: '',

      videoMainAction: '',
      videoActions: [],
      videoTags: [],
      videoClothing: []
    }
  },
  methods: {
    imageChanged() {
      if (this.computeVideos.length > 0) {
        this.videoTags = []
        this.videoClothing = []
        this.videoActions = []
        this.videoName = this.computeVideos[this.videoInEdit].split('/').slice(-1)[0]
        this.videoName = this.removeDigits(this.videoName)
        var tokens = this.videoName.split('.')[0].split('_');
        tokens.forEach((t) => {
          this.videoTags.push(t)
        })
        this.videoMainAction = this.videoTags[0]
        this.videoActions = this.$refs.actionPicker.parseTags(this.videoTags, false)
        this.videoClothing = this.$refs.clothesPicker.parseTags(this.videoTags, false)
      }
    },
    onHover(e) {
      if (e.target.paused) {
        e.target.play();
      }
    },
    onChange() {
      setTimeout(() => {
        var newFileName = this.computeVideos[this.videoInEdit].split('/').slice(0, -1).join('/') + '/'
          + this.videoMainAction
          + (this.videoClothing.length > 0 ? ('_' + this.videoClothing.join("_")) : '')
          + (Math.floor(Math.random() * 2000)) + "." + this.computeVideos[this.videoInEdit].split(".").slice(-1);
        window.ipcRenderer.send('img:rename', { oldPath: this.computeVideos[this.videoInEdit], newPath: newFileName });
        this.actualVideos[this.videoInEdit] = newFileName;
        this.imageChanged()
        this.$emit("change");
      }, 200);
    },
    changeIndex(nb) {
      if (this.videoInEdit + nb >= this.computeVideos.length) {
        this.videoInEdit = 0
      }
      else if (this.videoInEdit + nb < 0) {
        this.videoInEdit = this.computeVideos.length - 1
      } else {
        this.videoInEdit += nb
      }
      this.imageChanged()
    },
    removeDigits(str) {
      return str.replace(/[0-9]/g, '')
    },
    onStrip(clothe) {
      if (clothe != '') {
        this.videoMainAction = 'strip_' + clothe
      }
      this.onChange()
    },
    onActionChange(actions) {
      if (actions.length > 0) {
        this.videoMainAction = actions[0]
        this.onChange()
      }
    }
  },
  computed: {
    computeVideos() {
      return this.actualVideos;
    }
  },
  created() {
    this.videos.forEach((v) => {
      this.actualVideos.push(v);
    });
  },
  mounted() {
    this.imageChanged()
  }
})
</script>
<style>
.pageBody {
  display: flex;
  justify-content: space-between;
  align-items: start;
  flex-flow: row wrap;
}

.navBar {
  width: 100%;
  display: flex;
  justify-content: center;
  color: black;
  font-size: 3vh;
}

.title {
  display: flex;
  justify-content: center;
  color: black;
  font-size: 3vh;
}

.mediaPlayer {
  flex-basis: 20vw;
  display: flex;
  justify-content: center;
}

.wrong {
  outline: 3px red solid;
}

.imgGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
}

.gridContainer {
  width: 100%;
}

.selected {
  outline: 3px skyblue solid;
}

.col {
  display: inline-block;
  vertical-align: top;
}

.editPanel {
  background-color: pink;
}

.peopleSelector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-column-gap: 0.5vw;
}

.peopleOption {
  background-color: white;
  border-radius: 2vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5vh;
  cursor: pointer;
}

.peopleOption.active {
  outline: darkmagenta solid 2px;
}
</style>