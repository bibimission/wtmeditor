<template>
  <div class="tagGroup">
    <q-bar class="bg-primary">{{ group.label }}</q-bar>
    <div class="options" :class="{ icons: hasIcons }">
      <template v-for="o in group.options" :key="o.tag">
        <div v-if="o.icon" class="vignette" :class="stateOf(o)" :title="o.label" @click="$emit('toggle', o)">
          <img :src="'/' + o.icon" :alt="o.label">
        </div>
        <q-chip v-else dense clickable square class="option" :class="stateOf(o)" @click="$emit('toggle', o)">{{ o.label }}</q-chip>
      </template>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
import { hasTag } from 'src/shared/tagCodec'

export default defineComponent({
  props: {
    group: Object,
    files: Array
  },
  emits: ['toggle'],
  computed: {
    hasIcons() {
      return this.group.options.some((o) => o.icon)
    }
  },
  methods: {
    // "active" on every file, "partial" on some of them.
    stateOf(option) {
      const count = this.files.filter((file) => hasTag(file.tokens, option.tag)).length
      if (count === 0) {
        return ''
      }
      return count === this.files.length ? 'active' : 'partial'
    }
  }
})
</script>
<style lang="css" scoped>
.q-bar {
  height: auto;
  min-height: 32px;
  color: white;
  font-size: 15px;
  margin-bottom: 0.5vh;
}

.options {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 0.5vh;
}

.options.icons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4vw;
}

.vignette {
  border-radius: 1vh;
  overflow: hidden;
  background-color: white;
  cursor: pointer;
}

.vignette img {
  display: block;
  width: 100%;
}

.vignette.active {
  outline: rgb(255, 34, 71) solid 4px;
  outline-offset: -2px;
}

.vignette.partial {
  outline: rgb(255, 34, 71) dashed 3px;
  outline-offset: -2px;
}

.option {
  background-color: white;
  color: black;
}

.option.active {
  background-color: var(--q-primary);
  color: white;
}

.option.partial {
  background-color: white;
  color: black;
  outline: var(--q-primary) dashed 2px;
  outline-offset: -2px;
}
</style>
