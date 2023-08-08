<template>
  <q-page class="flex flex-center">
    <div class="header">
      <div class="loadDiv">
        <q-input v-model="folderPath" label="Girl Name" />
        <q-btn @click="loadFolder" glossy color="green" >Load</q-btn>
        <q-btn @click="createFolder" glossy color="purple" >Create</q-btn>
      </div>
      <div class="tabHead">
        <q-tabs
            v-model="tab"
            class="text-teal"
          >
            <q-tab name="infos" icon="info" label="Infos" />
            <q-tab name="bodyparts" icon="woman" label="Bodyparts" />
            <q-tab name="events" icon="event" label="Events" />
            <q-tab name="photoshoots" icon="photo" label="Photoshoots" />
            <q-tab name="vids" icon="movie" label="Videos" />
          </q-tabs>
        </div>
    </div>
      <div clas="tabContent">
        <q-tab-panels v-model="tab" animated class="bg-white text-white">
            <q-tab-panel name="infos">
              <GirlInfoForm v-model="girlInfos" @change="saveGirl" ref="girlInfoForm"></GirlInfoForm>
            </q-tab-panel>

            <q-tab-panel name="bodyparts">
              <BodyPartsSection :photos="bodyPhotos" :folderPath="folderPath" @change="loadFolder"></BodyPartsSection>
            </q-tab-panel>

            <q-tab-panel name="events">
              <EventSection :files="eventFiles"></EventSection>
            </q-tab-panel>

            <q-tab-panel name="photoshoots">
              <PhotoshootSection :files="photoshootFiles" @change="loadFolder"></PhotoshootSection>
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

export default defineComponent({
  name: 'IndexPage',
  components: {
    GirlInfoForm,
    BodyPartsSection,
    VideosSection,
    PhotoshootSection,
    EventSection
  },
  setup () {
    return {
      tab: ref('infos')
    }
  },
  data: function(){
    return {
      folderPath: "Nicole_Ray",
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
      eventFiles: []
    }
  },
  methods: {
    loadFolder(){
      window.ipcRenderer.invoke('folder:load', {name: this.folderPath}).then((files)=>{
          var data = JSON.parse(files);
          this.girlInfos = data.infos;
          if(this.$refs.girlInfoForm){
            this.$refs.girlInfoForm.load(data.infos);
          }

          this.bodyPhotos = data.files.filter(f => f.split('/bodyparts/').length > 1 || f.split(this.folderPath+'/face').length > 1);
          this.videos = data.files.filter(f => f.split('/vids/').length > 1);
          this.photoshootFiles = data.files.filter(f => f.split('/photoshoots/').length > 1);
          this.eventFiles = data.files.filter(f => f.split('/events/').length > 1);
      });
    },
    createFolder(){
      window.ipcRenderer.invoke('folder:create', {name: this.folderPath}).then((files)=>{
          console.log(files)
      });
    },
    saveGirl(){
      window.ipcRenderer.send('girl:infos:write', {name: this.folderPath, girl: JSON.stringify(this.girlInfos)});
    }
  },
  computed: {
    computeVideos(){
      return this.videos;
    }
  }
})
</script>
<style>
.header{
  width: 100%;
  text-align: center;
}
.loadDiv{
  display: inline-block;
}
.tabHead{
  display: inline-block;
}
.tabContent{
  width: 90%;
}
</style>
