<template>
  <q-dialog :model-value="modelValue" maximized @update:model-value="$emit('update:modelValue', $event)">
    <q-card v-if="file" class="detail">
      <div class="pageBody">
        <div class="editPanel">
          <TagGroup v-for="g in leftGroups" :key="g.id" :group="g" :files="[file]" @toggle="toggleTag([file], $event)"></TagGroup>
        </div>
        <div class="mediaPlayer">
          <div class="mediaContainer">
            <CustomMedia :key="file.id" :file="file" @convert="convert(file)"></CustomMedia>
          </div>
          <div class="fileName">{{ file.name }}</div>
          <div class="detected">
            <q-badge v-for="t in detectedTags" :key="t" color="secondary" text-color="black">{{ t }}</q-badge>
            <span v-if="detectedTags.length === 0">The game finds no tag in this name</span>
          </div>
          <div v-if="unknownWords.length > 0" class="detected">
            <span>Not read by the game:</span>
            <q-chip v-for="w in unknownWords" :key="w" dense removable color="grey-4" @remove="removeWord(w)">{{ w }}</q-chip>
          </div>
          <div class="navBar">
            <q-btn color="orange" glossy @click="$emit('move', -1)">Prev.</q-btn>
            <span>{{ position }}</span>
            <q-btn color="orange" glossy @click="$emit('move', 1)">Next</q-btn>
            <q-btn color="negative" glossy icon="delete" title="Delete this media" :disable="file.busy" @click="$emit('remove')" />
            <q-btn v-close-popup color="primary" glossy icon="close" title="Back to the grid" />
          </div>
        </div>
        <div class="editPanel">
          <TagGroup v-for="g in rightGroups" :key="g.id" :group="g" :files="[file]" @toggle="toggleTag([file], $event)"></TagGroup>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from 'vue'
import { usePack } from 'src/composables/usePack'
import { tagsOfTokens, unknownTokens } from 'src/shared/tagCodec'
import { allGroups, HIDDEN_TAGS } from 'src/shared/tagSchema'
import CustomMedia from './CustomMedia.vue'
import TagGroup from './TagGroup.vue'

const groups = allGroups()

export default defineComponent({
  components: {
    CustomMedia,
    TagGroup
  },
  props: {
    modelValue: Boolean,
    file: Object,
    position: String
  },
  emits: ['update:modelValue', 'move', 'remove'],
  setup() {
    const { setTokens, toggleTag, convert } = usePack()
    return {
      setTokens,
      toggleTag,
      convert,
      leftGroups: groups.filter((g) => g.side === 'left'),
      rightGroups: groups.filter((g) => g.side === 'right')
    }
  },
  computed: {
    detectedTags() {
      return tagsOfTokens(this.file.tokens).filter((tag) => !HIDDEN_TAGS.includes(tag))
    },
    unknownWords() {
      return unknownTokens(this.file.tokens)
    }
  },
  methods: {
    removeWord(word) {
      this.setTokens(this.file, this.file.tokens.filter((token) => token !== word))
    }
  }
})
</script>
<style lang="css" scoped>
.detail {
  padding: 12px;
}

.pageBody {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1vw;
  color: black;
}

.editPanel {
  flex: 0 0 22vw;
  max-height: calc(100vh - 24px);
  overflow-y: auto;
  padding: 0.5vh 0.5vw;
  background-color: pink;
}

.mediaPlayer {
  flex: 1 1 auto;
  min-width: 0;
}

.mediaContainer {
  height: 72vh;
  position: relative;
}

.fileName {
  text-align: center;
  font-size: 2vh;
  margin-top: 1vh;
  overflow-wrap: anywhere;
}

.detected {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.3vw;
  margin-top: 0.5vh;
}

.navBar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1vw;
  font-size: 2.5vh;
  margin-top: 1vh;
}
</style>
