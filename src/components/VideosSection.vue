<template>
  <div>
    <div class="pageBody">
      <div class="col editPanel">
        <div>
          <q-bar class="bg-primary">Photo type</q-bar>
          <q-checkbox v-model="isProfile" label="Profile pic" @update:model-value="onChange"></q-checkbox>
          <q-checkbox v-model="isPortrait" label="Portrait pic (Only face)" @update:model-value="onChange"></q-checkbox>
        </div>
        <JobPicker v-model="videoJob" @update:model-value="onChange" ref="jobPicker"></JobPicker>
        <OutfitPicker v-model="videoOutfit" @update:model-value="onChange" ref="outfitPicker"></OutfitPicker>
        <MoodPicker v-model="videoMood" @update:model-value="onChange" ref="moodPicker"></MoodPicker>
        <div>
          <q-bar class="bg-primary">Additional tags</q-bar>
          <q-checkbox v-model="isPublic" label="Public (Exhib)" @update:model-value="onChange"></q-checkbox>
          <q-checkbox v-model="isDirty" label="Dirty" @update:model-value="onChange"></q-checkbox>
          <q-checkbox v-model="isWet" label="Wet" @update:model-value="onChange"></q-checkbox>
          <q-checkbox v-model="isDom" label="Femdom" @update:model-value="onChange"></q-checkbox>
          <q-checkbox v-model="isSub" label="Submissive" @update:model-value="onChange"></q-checkbox>
        </div>
      </div>
      <div v-if="computeVideos.length > 0" class="col mediaPlayer">
        <div class="mediaContainer">
          <CustomMedia :src="computeVideos[videoInEdit]" :forceVideo="true"></CustomMedia>
        </div>
        <div class="title">{{ videoMainAction }}</div>
        <div class="title">{{ videoName }}</div>
        <div class="navBar">
          <q-btn color="orange" glossy @click="changeIndex(-1)">Prec.</q-btn>
          <span>{{ videoInEdit + '/' + computeVideos.length }}</span>
          <q-btn color="orange" glossy @click="changeIndex(1)">Next.</q-btn>
        </div>
      </div>
      <div class="col editPanel">
        <PartnerPicker v-model="videoPartner" @update:model-value="onChange" ref="partnerPicker"></PartnerPicker>
        <VideoActionPicker v-model="videoActions" ref="actionPicker" @update:model-value="onActionChange"></VideoActionPicker>
      </div>
    </div>

  </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';
import VideoActionPicker from './selectors/VideoActionPicker.vue';
import JobPicker from './selectors/JobPicker.vue';
import MoodPicker from './selectors/MoodPicker.vue';
import PartnerPicker from './selectors/PartnerPicker.vue';
import OutfitPicker from './selectors/OutfitPicker.vue';

export default defineComponent({
  components: {
    CustomMedia,
    VideoActionPicker,
    JobPicker,
    MoodPicker,
    PartnerPicker,
    OutfitPicker
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

      isProfile: false,
      isPortrait: false,

      isPublic: false,
      isDirty: false,
      isWet: false,
      isDom: false,
      isSub: false,

      videoJob: null,
      videoMood: null,
      videoPartner: null,
      videoOutfit: null
    }
  },
  methods: {
    imageChanged() {
      if (this.computeVideos.length > 0) {
        this.videoTags = []
        this.videoActions = []
        this.videoName = this.computeVideos[this.videoInEdit].split('/').slice(-1)[0]
        this.videoName = this.videoName.split('(')[0]
        var tokens = this.videoName.split('.')[0].split('_');
        tokens.forEach((t) => {
          this.videoTags.push(t)
        })
        this.videoMainAction = this.videoTags[0]
        this.videoActions = this.$refs.actionPicker.parseTags(this.videoName, false)
        this.videoJob = this.$refs.jobPicker.parse(this.videoName)
        this.videoMood = this.$refs.moodPicker.parse(this.videoName)
        this.videoPartner = this.$refs.partnerPicker.parse(this.videoName)
        this.videoOutfit = this.$refs.outfitPicker.parse(this.videoName)

        this.isPortrait = this.videoName.split('portrait').length > 1
        this.isProfile = this.videoName.split('profile').length > 1

        this.isPublic = this.videoName.split('public').length > 1
        this.isDirty = this.videoName.split('dirty').length > 1
        this.isWet = this.videoName.split(' wet').length > 1
        this.isDom = this.videoName.split(' dom').length > 1
        this.isSub = this.videoName.split(' sub').length > 1

        console.log(this.videoPartner)
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
          + (this.isProfile ? 'profile ' : '')
          + (this.isPortrait ? 'portrait ' : '')
          + this.videoActions.filter(a => a != undefined).join(' ') + ' '
          + (this.videoPartner != null ? (this.videoPartner + ' ') : '')
          + (this.videoJob != null ? (this.videoJob + ' ') : '')
          + (this.videoOutfit != null ? (this.videoOutfit + ' ') : '')
          + (this.videoMood != null ? (this.videoMood + ' ') : '')
          + (this.isPublic ? 'public ' : '')
          + (this.isDirty ? 'dirty ' : '')
          + (this.isWet ? 'wet ' : '')
          + (this.isDom ? 'dom ' : '')
          + (this.isSub ? 'sub ' : '')

          + '(' + (Math.floor(Math.random() * 2000)) + ")." + this.computeVideos[this.videoInEdit].split(".").slice(-1);
        window.ipcRenderer.send('img:rename', { oldPath: this.computeVideos[this.videoInEdit], newPath: newFileName });
        this.actualVideos[this.videoInEdit] = newFileName;
        this.imageChanged()
        // this.$emit("change");
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
  flex-basis: 15vw;
  display: flex;
  justify-content: center;
}

.mediaContainer {
  height: 70vh;
  position: relative;
}

.wrong {
  outline: 3px red solid;
}

.col {
  display: inline-block;
  vertical-align: top;
}

.editPanel {
  background-color: pink;
  color: black;
  max-width: 20vw;
}

.q-bar {
  color: white;
}
</style>