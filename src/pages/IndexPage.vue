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
          <q-tab name="mod_meta_data" icon="info" label="Mod Infos" />
          <q-tab name="girl" icon="woman" label="Girl info" />
          <q-tab name="cards" icon="label" label="Cards" />
          <q-tab name="passives" icon="event" label="Passives" />
          <q-tab name="videos" icon="movie" label="Videos" />
        </q-tabs>
      </div>
    </div>
    <div class="tabContent">
      <q-tab-panels v-model="tab" animated class="bg-white text-white">

        <q-tab-panel name="mod_meta_data">
          <ModInfoSection :files="files" ref="modInfoForm"></ModInfoSection>
        </q-tab-panel>

        <q-tab-panel name="girl">
          <GirlInfoForm v-model="girlInfos" ref="girlInfoForm"></GirlInfoForm>
        </q-tab-panel>

        <q-tab-panel name="videos">
          <VideosSection ref="videoSection" :files="files"></VideosSection>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import GirlInfoForm from 'components/GirlInfoForm.vue'
import ModInfoSection from 'components/ModInfoSection.vue'
import VideosSection from 'src/components/VideosSection.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    GirlInfoForm,
    ModInfoSection,
    VideosSection
  },
  setup() {
    return {
      tab: ref('mod_meta_data')
    }
  },
  data: function () {
    return {
      folderPath: "",
      files: []
    }
  },
  methods: {
    loadFolder() {
      window.ipcRenderer.invoke('folder:load', { name: this.folderPath }).then((files) => {
        var data = JSON.parse(files);
        this.files = data.files;
        console.log('Files', this.files)
        /*
        var charDefs = data.files.filter(f => f.type == 'json' && f.file.split('/characters/').length > 1)
        console.log(charDefs)
        this.videos = data.files.filter(f => f.type == 'video');
        this.images = data.files.filter(f => f.type == 'image');
        */
      });
    },
    createFolder() {
      window.ipcRenderer.invoke('folder:create', { name: this.folderPath }).then((files) => {
        console.log(files)
      });
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
