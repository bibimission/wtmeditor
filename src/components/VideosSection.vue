<template>
  <div>
    <div class="pageBody">
      <q-btn @click="resetIds" color="red">Reset Ids</q-btn>
      <div v-if="computeVideos.length > 0" class="col mediaPlayer">
        <CustomMedia :src="computeVideos[videoInEdit].url" :forceVideo="true"></CustomMedia>
        <div class="title">{{ videoMainAction }}</div>
        <div class="title">{{ videoName }}</div>
        <div class="navBar">
          <q-btn color="orange" glossy @click="changeIndex(-1)">Prec.</q-btn>
          <span>{{ videoInEdit + '/' + computeVideos.length }}</span>
          <q-btn color="orange" glossy @click="changeIndex(1)">Next.</q-btn>
        </div>
        <div class="row">
          <q-btn @click="deleteVideo" color="red" class="mt-xl">Delete this video</q-btn>
        </div>
      </div>
      <div class="col editPanel">
        <q-bar class="bg-primary">Other People</q-bar>
        <div class="peopleSelector">
          <div v-for="(o, i) in partyOptions" :key="i" class="peopleOption" @click="toggleParty(o)" :class="{ 'active': videoInEditInfo.participant_tags.find(t => t == o.value) }">
            <img :src="'/img/people/' + o.img">
          </div>
        </div>
        <VideoActionPicker v-model="videoInEditInfo.action_tags" ref="actionPicker" @update:model-value="onActionChange"></VideoActionPicker>
      </div>
    </div>

  </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';
import VideoActionPicker from './selectors/VideoActionPicker.vue';

export default defineComponent({
  components: {
    CustomMedia,
    VideoActionPicker
  },
  props: {
    files: {
      type: Array,
      default: () => { return [] }
    }
  },
  emits: ['change'],
  data: function () {
    return {
      actualVideos: [],
      videosInfos: [],

      videoInEdit: 0,
      videoName: '',

      videoMainAction: '',

      videoInEditInfo: {
        file: "",
        action_tags: [],
        participant_tags: [],
        weight: 1.0
      },
      videoInfoIndex: 0,

      partyOptions: [
        { label: 'Alone', value: '', img: 'none.png' },
        { label: 'Black', value: 'BBC', img: 'black.webp' },
        { label: 'White', value: 'WHITE_MAN', img: 'white.webp' },
        { label: 'Asian', value: 'JAPANESE_MAN', img: 'asian.jpg' },
        { label: 'Cuck', value: 'CUCK_BOYFRIEND', img: 'man.png' },
        { label: 'Blonde girl', value: 'BLONDE', img: 'blonde.webp' },
        { label: 'Redhead girl', value: 'REDHEAD', img: 'redhead.webp' },
        { label: 'Black hair girl', value: 'BLACK_HAIR', img: 'black_hair.webp' },
        { label: 'Brunette girl', value: 'BRUNETTE', img: 'brunette.jpg' },
      ],
      activeParties: [''],
    }
  },
  methods: {
    imageChanged() {
      if (this.computeVideos.length > 0) {
        this.activeParties = []
        this.videoName = this.computeVideos[this.videoInEdit].url.split('/').slice(-1)[0]
        this.videoName = this.videoName

        this.videoInfoIndex = this.videosInfos.findIndex(c => c.file == this.videoName)
        if (this.videoInfoIndex == -1) {
          this.videosInfos.push({ file: this.videoName, action_tags: [], participant_tags: [], weight: 1.0 })
          this.videoInfoIndex = this.videosInfos.findIndex(c => c.file == this.videoName)
        }

        this.videoInEditInfo = this.videosInfos[this.videoInfoIndex]
        this.videoInEditInfo.file = this.videoName
      }
    },
    onHover(e) {
      if (e.target.paused) {
        e.target.play();
      }
    },
    onChange() {
      setTimeout(() => {
        this.videosInfos[this.videoInfoIndex] = this.videoInEditInfo
        var videosInfosFile = this.files.find(f => f.type == 'json' && f.url.split('videos/video_tags.json').length > 1)
        if (videosInfosFile != null) {
          window.ipcRenderer.send('file:write', { path: videosInfosFile.url, text: JSON.stringify(this.videosInfos) })
        }

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
    onActionChange(actions) {
      if (actions.length > 0) {
        this.videoMainAction = actions[0]
        this.onChange()
      }
    },
    toggleParty(p) {
      if (p.value === '') {
        this.videoInEditInfo.participant_tags = []
      } else {
        this.videoInEditInfo.participant_tags = this.videoInEditInfo.participant_tags.filter((o) => o !== '')
        if (this.videoInEditInfo.participant_tags.filter((o) => o == p.value).length > 0) {
          this.videoInEditInfo.participant_tags = this.videoInEditInfo.participant_tags.filter((o) => o !== p.value)
        } else {
          this.videoInEditInfo.participant_tags.push(p.value)
        }
      }
      this.onChange()
    },
    resetIds() {
      this.computeVideos.forEach((p, i) => {
        var fileName = p.url
        var fileExt = fileName.split('.')[1]
        var newName = fileName.split("/").slice(0, -1).join("/") + "/" + i + "." + fileExt;
        setTimeout(() => {
          window.ipcRenderer.send('img:rename', { oldPath: fileName, newPath: newName });
        }, i * 100)

      });
    },
    loadVideos() {
      this.actualVideos = []
      var videos = this.files.filter(f => f.type == 'video')
      videos.forEach((v) => {
        this.actualVideos.push(v);
      });
      // this.actualVideos.sort((a, b) => { return parseInt(a.name.split('.')[0]) < parseInt(b.name.split('.')[0]) ? -1 : 1 })
      var videosInfos = this.files.find(f => f.type == 'json' && f.url.split('videos/video_tags.json').length > 1)
      if (videosInfos != null) {
        this.videosInfos = JSON.parse(videosInfos.content)
      }
    },
    deleteVideo() {
      window.ipcRenderer.send('file:delete', { path: this.computeVideos[this.videoInEdit].url });
    }
  },
  computed: {
    computeVideos() {
      return this.actualVideos;
    }
  },
  created() {
    this.loadVideos()
  },
  mounted() {
    this.loadVideos()
    this.imageChanged()
    console.log(this.files)
  },
  watch: {
    files(newV) {
      console.log(newV)
    }
  }
})
</script>
<style>
.pageBody {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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