<template>
  <q-page class="flex">
    <div class="header">
      <div class="loadDiv">
        <q-select :model-value="state.girl" :options="state.girls" label="Pack" dense class="packSelect" @update:model-value="load" @popup-show="refreshGirls" />
        <q-input v-model="newName" label="New pack" dense class="packSelect" @keyup.enter="createPack" />
        <q-btn glossy color="purple" class="h-fit" :disable="!newName.trim()" @click="createPack">Create</q-btn>
        <q-btn glossy color="green" class="h-fit" icon="undo" :disable="state.undoCount === 0 || state.converting > 0" @click="undo">
          <q-badge v-if="state.undoCount > 0" floating color="red">{{ state.undoCount }}</q-badge>
        </q-btn>
      </div>
      <div class="tabHead">
        <q-tabs v-model="tab">
          <q-tab name="infos" icon="info" label="Infos" />
          <q-tab name="media" icon="movie" label="Media" />
        </q-tabs>
      </div>
      <q-btn round glossy color="primary" label="?" class="helpButton" title="Tags without media" :disable="!state.girl" @click="showMissing = true" />
    </div>
    <MissingTagsDialog v-model="showMissing"></MissingTagsDialog>
    <div class="notices">
      <q-banner v-if="state.girl && state.files.length > 0 && !hasProfile" dense class="bg-orange text-white">
        No picture is tagged profile or portrait: the game will show an error for this girl.
      </q-banner>
      <q-banner v-if="toConvert > 0" dense class="bg-orange text-white">
        {{ toConvert }} file(s) in a format the game reads badly.
        <template #action>
          <q-btn flat label="Convert all" :disable="state.converting > 0" @click="convertAll" />
        </template>
      </q-banner>
      <q-banner v-if="state.ignored.length > 0" dense class="bg-grey-7 text-white">
        Ignored by the game: {{ state.ignored.join(', ') }}
      </q-banner>
    </div>
    <div class="tabContent">
      <q-tab-panels v-model="tab" animated class="bg-white">
        <q-tab-panel name="infos">
          <GirlInfoForm></GirlInfoForm>
        </q-tab-panel>
        <q-tab-panel name="media">
          <MediaSection></MediaSection>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { usePack } from 'src/composables/usePack'
import { hasTag } from 'src/shared/tagCodec'
import GirlInfoForm from 'components/GirlInfoForm.vue'
import MediaSection from 'components/MediaSection.vue'
import MissingTagsDialog from 'components/MissingTagsDialog.vue'

export default defineComponent({
  name: 'IndexPage',
  components: {
    GirlInfoForm,
    MediaSection,
    MissingTagsDialog
  },
  setup() {
    return usePack()
  },
  data() {
    return {
      tab: 'media',
      newName: '',
      showMissing: false
    }
  },
  computed: {
    hasProfile() {
      return this.state.files.some((f) => hasTag(f.tokens, 'profile') || hasTag(f.tokens, 'portrait'))
    },
    toConvert() {
      return this.state.files.filter((f) => f.needsConversion).length
    }
  },
  mounted() {
    this.refreshGirls()
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    async createPack() {
      if (await this.create(this.newName)) {
        this.newName = ''
      }
    },
    onKey(event) {
      const typing = /^(INPUT|TEXTAREA)$/.test(event.target.tagName)
      if (event.ctrlKey && event.key.toLowerCase() === 'z' && !typing) {
        event.preventDefault()
        this.undo()
      }
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
  gap: 0.8vw;
  border: var(--color-fourth) solid 3px;
  padding: 1vh 1vw;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
}

.packSelect {
  width: 12vw;
}

.tabHead {
  display: flex;
  margin: auto;
  height: fit-content;
}

.helpButton {
  align-self: center;
  margin-right: 1vw;
}

.notices,
.tabContent {
  width: 100%;
}

.tabContent {
  height: fit-content;
}

.q-tab--active {
  color: white;
  background-color: var(--color-second);
}
</style>
