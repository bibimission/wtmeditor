<template>
  <q-page class="flex">
    <div class="header">
      <div class="loadDiv row">
        <q-input v-model="folderPath" label="Girl Name" class="col-6" />
        <q-btn @click="loadFolder" glossy color="green" class="h-fit">Load</q-btn>
        <q-btn @click="createFolder" glossy color="purple" class="h-fit">Create</q-btn>
      </div>
      <div class="tabHead">
        <q-tabs v-model="tab">
          <q-tab name="infos" icon="info" label="Infos" />
          <q-tab name="bodyparts" icon="person" label="Bodyparts" />
          <q-tab name="fullbody" icon="woman" label="Fullbody" />
          <q-tab name="events" icon="event" label="Events" />
          <q-tab name="clothing" icon="school" label="Clothes" />
          <q-tab name="photoshoots" icon="photo" label="Photoshoots" />
          <q-tab name="videoshoots" icon="movie" label="Videoshoots" />
          <q-tab name="vids" icon="movie" label="Videos" />
        </q-tabs>
      </div>
    </div>
    <div class="tabContent">
      <q-tab-panels v-model="tab" animated class="bg-white text-white">
        <q-tab-panel name="infos">
          <GirlInfoForm v-model="girlInfos" @change="saveGirl" ref="girlInfoForm"></GirlInfoForm>
        </q-tab-panel>

        <q-tab-panel name="bodyparts">
          <BodyPartsSection :photos="bodyPhotos" :folderPath="folderPath" @change="loadFolder"></BodyPartsSection>
        </q-tab-panel>

        <q-tab-panel name="fullbody">
          <FullBodySection :photos="fullbodyFiles" @change="loadFolder"></FullBodySection>
        </q-tab-panel>

        <q-tab-panel name="events">
          <EventSection :files="eventFiles" :folderPath="folderPath"></EventSection>
        </q-tab-panel>

        <q-tab-panel name="clothing">
          <ClothingSection :files="clothesFiles" :folderPath="folderPath"></ClothingSection>
        </q-tab-panel>

        <q-tab-panel name="photoshoots">
          <PhotoshootSection :files="photoshootFiles" @change="loadFolder"></PhotoshootSection>
        </q-tab-panel>

        <q-tab-panel name="videoshoots">
          <VideoShootSection :files="videoshootFiles" @change="loadFolder"></VideoShootSection>
        </q-tab-panel>

        <q-tab-panel name="vids">
          <VideosSection :videos="computeVideos" @change="loadFolder"></VideosSection>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import GirlInfoForm from 'components/GirlInfoForm.vue'
import BodyPartsSection from 'src/components/BodyPartsSection.vue'
import VideosSection from 'src/components/VideosSection.vue'
import PhotoshootSection from 'src/components/PhotoshootSection.vue'
import EventSection from 'src/components/EventSection.vue'
import FullBodySection from 'src/components/FullBodySection.vue'
import ClothingSection from 'src/components/ClothingSection.vue'
import VideoShootSection from 'src/components/VideoShootSection.vue'

export default defineComponent({
  name: 'IndexPage',
  components: {
    GirlInfoForm,
    BodyPartsSection,
    VideosSection,
    PhotoshootSection,
    EventSection,
    FullBodySection,
    ClothingSection,
    VideoShootSection
  },
  setup() {
    return {
      tab: ref('infos')
    }
  },
  data: function () {
    return {
      folderPath: "",
      girlInfos: {
        first_name: "",
        last_name: "",
        traits: [],
        source: "",
        modder: "",
        sensitive_area: ""
      },
      bodyPhotos: [],
      videos: [],
      photoshootFiles: [],
      videoshootFiles: [],
      eventFiles: [],
      fullbodyFiles: [],
      clothesFiles: [],

      apiGirls: []
    }
  },
  methods: {
    loadFolder() {
      window.ipcRenderer.invoke('folder:load', { name: this.folderPath }).then((files) => {
        var data = JSON.parse(files);
        this.girlInfos = data.infos;
        if (this.$refs.girlInfoForm) {
          this.$refs.girlInfoForm.load(data.infos);
        }

        this.bodyPhotos = data.files.filter(f => f.split('/body_images/').length > 1 || f.split(this.folderPath + '/face').length > 1 || f.split(this.folderPath + '/portrait').length > 1 || f.split(this.folderPath + '/tportrait').length > 1);
        this.videos = data.files.filter(f => f.split('/vids/').length > 1);
        this.photoshootFiles = data.files.filter(f => f.split('/photoshoots/').length > 1);
        this.videoshootFiles = data.files.filter(f => f.split('/videoshoots/').length > 1);
        this.eventFiles = data.files.filter(f => f.split('/events/').length > 1);
        this.clothesFiles = data.files.filter(f => f.split('/clothing/').length > 1);
        this.fullbodyFiles = data.files.filter(f => f.split('/fullbody/').length > 1);
      });
    },
    createFolder() {
      window.ipcRenderer.invoke('folder:create', { name: this.folderPath }).then((files) => {
        console.log(files)
      });
    },
    saveGirl() {
      window.ipcRenderer.send('girl:infos:write', { name: this.folderPath, girl: JSON.stringify(this.girlInfos) });
    }
  },
  computed: {
    computeVideos() {
      return this.videos;
    }
  },
  mounted() {
    window.ipcRenderer.invoke('api:getAll', {}).then((girlList) => {
      this.apiGirls = girlList
    })
  }
})
</script>
<style scoped>
.header {
  width: 100%;
  text-align: center;
  background-color: var(--color-third);
  height: fit-content;
  display: flex;
}

.flex {
  display: flex;
  align-content: flex-start;
}

.loadDiv {
  display: flex;
  width: 30vw;
  border: var(--color-fourth) solid 3px;
  padding: 1vh 0;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
}

.tabHead {
  display: flex;
  margin: auto;
  height: fit-content;
}

.tabContent {
  width: 100%;
  height: fit-content;
}

.q-tab--active {
  color: white;
  background-color: var(--color-second);
}
</style>
