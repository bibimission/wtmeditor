<template>
  <div v-if="state.files.length > 0" class="workspace" :class="{ withTags: tagsVisible }">
    <CoverageSidebar v-model="tagFilter"></CoverageSidebar>
    <div class="center">
      <div class="filters">
        <q-btn-toggle v-model="filter" dense no-caps unelevated toggle-color="primary" :options="filterOptions" />
        <q-chip v-if="tagFilter" dense removable color="primary" text-color="white" @remove="tagFilter = null">{{ tagFilter }}</q-chip>
      </div>
      <div ref="grid" class="grid" @click.self="clearSelection">
        <MediaThumb v-for="f in visibleFiles" :key="f.id" :file="f" :selected="selectedIdSet.has(f.id)" @click="onThumbClick($event, f)" @dblclick="openDetail(f)"></MediaThumb>
        <div v-if="visibleFiles.length === 0" class="noResult">No media matches this filter.</div>
      </div>
      <div class="selectionBar">
        <template v-if="selectedFiles.length > 0">
          <span class="count">{{ selectedFiles.length }} selected</span>
          <q-space />
          <q-chip v-for="o in state.recentOptions" :key="o.tag" dense clickable square icon="add" @click="toggleTag(selectedFiles, o)">{{ o.label }}</q-chip>
          <q-btn dense flat no-caps icon="sell" :label="showTags ? 'Hide tags' : 'All tags'" @click="showTags = !showTags" />
          <q-btn v-if="convertibleSelected.length > 0" dense flat no-caps icon="transform" label="Convert" @click="convertFiles(convertibleSelected)" />
          <q-btn dense flat color="negative" icon="delete" title="Delete the selection" @click="removeSelection" />
        </template>
        <span v-else class="hint">Click a media to select it, Ctrl or Shift to select several, double-click to enlarge.</span>
      </div>
    </div>
    <div v-if="tagsVisible" class="tagPanel">
      <TagGroup v-for="g in tagGroups" :key="g.id" :group="g" :files="selectedFiles" @toggle="toggleTag(selectedFiles, $event)"></TagGroup>
    </div>
    <MediaDetail v-model="detailOpen" :file="selectedFiles[0]" :position="detailPosition" @move="move" @remove="removeSelection"></MediaDetail>
  </div>
  <div v-else class="empty">{{ state.girl ? 'This pack has no media yet.' : 'Load or create a pack first.' }}</div>
</template>
<script>
import { defineComponent } from 'vue'
import { usePack } from 'src/composables/usePack'
import { neighbourAfterRemoval, nextSelection } from 'src/shared/selection'
import { tagsOfTokens, unknownTokens } from 'src/shared/tagCodec'
import { allGroups } from 'src/shared/tagSchema'
import CoverageSidebar from './CoverageSidebar.vue'
import MediaDetail from './MediaDetail.vue'
import MediaThumb from './MediaThumb.vue'
import TagGroup from './TagGroup.vue'

const isUntagged = (file) => unknownTokens(file.tokens).length === file.tokens.length

export default defineComponent({
  components: {
    CoverageSidebar,
    MediaDetail,
    MediaThumb,
    TagGroup
  },
  setup() {
    const { state, selectedIdSet, selectedFiles, toggleTag, convertFiles, removeFiles } = usePack()
    return { state, selectedIdSet, selectedFiles, toggleTag, convertFiles, removeFiles, tagGroups: allGroups() }
  },
  data() {
    return {
      filter: 'all',
      tagFilter: null,
      showTags: true,
      detailOpen: false,
      anchor: null
    }
  },
  computed: {
    filterOptions() {
      const count = (test) => this.state.files.filter(test).length
      return [
        { value: 'all', label: `All ${this.state.files.length}` },
        { value: 'untagged', label: `Untagged ${count(isUntagged)}` },
        { value: 'convert', label: `To convert ${count((f) => f.needsConversion)}` }
      ]
    },
    // A selected media stays on screen until it is deselected,
    // so that tagging it does not make it vanish from a filter.
    visibleFiles() {
      return this.state.files.filter((f) => this.selectedIdSet.has(f.id) || this.matchesFilter(f))
    },
    visibleIds() {
      return this.visibleFiles.map((f) => f.id)
    },
    convertibleSelected() {
      return this.selectedFiles.filter((f) => f.needsConversion)
    },
    tagsVisible() {
      return this.showTags && this.selectedFiles.length > 0
    },
    detailPosition() {
      return `${this.visibleIds.indexOf(this.state.selectedIds[0]) + 1} / ${this.visibleIds.length}`
    }
  },
  watch: {
    selectedFiles(files) {
      if (files.length === 0) {
        this.detailOpen = false
      }
    },
    'state.girl'() {
      this.filter = 'all'
      this.tagFilter = null
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    matchesFilter(file) {
      if (this.tagFilter && !tagsOfTokens(file.tokens).includes(this.tagFilter)) {
        return false
      }
      if (this.filter === 'untagged') {
        return isUntagged(file)
      }
      return this.filter !== 'convert' || file.needsConversion
    },
    onThumbClick(event, file) {
      const options = { ctrl: event.ctrlKey, shift: event.shiftKey, anchor: this.anchor }
      this.state.selectedIds = nextSelection(this.state.selectedIds, this.visibleIds, file.id, options)
      if (!event.shiftKey) {
        this.anchor = file.id
      }
    },
    clearSelection() {
      this.state.selectedIds = []
      this.anchor = null
    },
    selectOnly(id) {
      this.state.selectedIds = [id]
      this.anchor = id
    },
    openDetail(file) {
      this.selectOnly(file.id)
      this.detailOpen = true
    },
    move(step) {
      const ids = this.visibleIds
      if (ids.length === 0) {
        return
      }
      const last = this.state.selectedIds[this.state.selectedIds.length - 1]
      const index = ids.indexOf(last)
      const next = index < 0 ? (step > 0 ? 0 : ids.length - 1) : (index + step + ids.length) % ids.length
      this.selectOnly(ids[next])
      this.$nextTick(() => this.$refs.grid?.querySelector('.thumb.selected')?.scrollIntoView({ block: 'nearest' }))
    },
    async removeSelection() {
      const files = [...this.selectedFiles]
      const next = neighbourAfterRemoval(this.state.selectedIds, this.visibleIds)
      if (this.detailOpen && next !== null) {
        this.selectOnly(next)
      }
      await this.removeFiles(files)
    },
    onKey(event) {
      if (/^(INPUT|TEXTAREA)$/.test(event.target.tagName) || this.state.files.length === 0) {
        return
      }
      if (event.key === 'ArrowLeft') {
        this.move(-1)
      } else if (event.key === 'ArrowRight') {
        this.move(1)
      } else if (this.detailOpen) {
        return
      } else if (event.key === 'Enter' && this.selectedFiles.length > 0) {
        this.detailOpen = true
      } else if (event.key === 'Escape') {
        this.clearSelection()
      } else if (event.key === 'Delete' && this.selectedFiles.length > 0) {
        this.removeSelection()
      } else if (event.ctrlKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        this.state.selectedIds = [...this.visibleIds]
      }
    }
  }
})
</script>
<style lang="css" scoped>
.workspace {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 10px;
  height: calc(100vh - 170px);
  min-height: 420px;
  color: black;
}

.workspace.withTags {
  grid-template-columns: 210px minmax(0, 1fr) 330px;
}

.center {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
}

.grid {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  grid-auto-rows: min-content;
  gap: 8px;
  padding: 3px;
}

.noResult {
  grid-column: 1 / -1;
  padding-top: 10vh;
  text-align: center;
  font-size: 18px;
}

.selectionBar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 46px;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  background-color: var(--color-fourth);
}

.count {
  font-weight: 500;
}

.hint {
  color: #555;
}

.tagPanel {
  overflow-y: auto;
  padding: 4px 8px;
  background-color: pink;
}

.empty {
  color: black;
  text-align: center;
  font-size: 3vh;
  padding-top: 10vh;
}
</style>
