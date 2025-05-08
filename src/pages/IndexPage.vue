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
          <q-tab name="vids" icon="movie" label="Videos" />
        </q-tabs>
      </div>
    </div>
    <div class="tabContent">
      <q-tab-panels v-model="tab" animated class="bg-white text-white">
        <q-tab-panel name="infos">
          <GirlInfoForm v-model="girlInfos" @change="saveGirl" ref="girlInfoForm"></GirlInfoForm>
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
import VideosSection from 'src/components/VideosSection.vue'

export default defineComponent({
  name: 'IndexPage',
  components: {
    GirlInfoForm,
    VideosSection
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
        last_name: ""
      },
      medias: []
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
        this.medias = data.files.filter(f => f.split('.ini').length <= 1);
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
      return this.medias;
    }
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
