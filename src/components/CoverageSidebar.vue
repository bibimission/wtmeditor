<template>
  <aside class="coverage">
    <div class="summary">
      <div>Pack coverage</div>
      <div class="percent">{{ percent }} %</div>
      <q-linear-progress :value="percent / 100" color="primary" rounded />
    </div>
    <div v-for="g in groups" :key="g.id" class="group">
      <div class="groupLabel">{{ g.label }}</div>
      <div v-for="o in g.options" :key="o.tag" class="row-tag" :class="{ active: o.tag === modelValue, empty: !g.optional && !count(o.tag) }" @click="select(o.tag)">
        <span>{{ o.label }}</span>
        <span>{{ count(o.tag) }}</span>
      </div>
    </div>
  </aside>
</template>
<script>
import { defineComponent } from 'vue'
import { usePack } from 'src/composables/usePack'
import { tagsOfTokens } from 'src/shared/tagCodec'
import { allGroups } from 'src/shared/tagSchema'

const groups = allGroups()

export default defineComponent({
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  setup() {
    return { state: usePack().state, groups }
  },
  computed: {
    counts() {
      const counts = {}
      for (const file of this.state.files) {
        for (const tag of tagsOfTokens(file.tokens)) {
          counts[tag] = (counts[tag] ?? 0) + 1
        }
      }
      return counts
    },
    percent() {
      const tags = groups.filter((g) => !g.optional).flatMap((g) => g.options)
      const covered = tags.filter((o) => this.counts[o.tag] > 0).length
      return Math.round((100 * covered) / tags.length)
    }
  },
  methods: {
    count(tag) {
      return this.counts[tag] ?? 0
    },
    select(tag) {
      this.$emit('update:modelValue', tag === this.modelValue ? null : tag)
    }
  }
})
</script>
<style lang="css" scoped>
.coverage {
  height: 100%;
  overflow-y: auto;
  padding: 8px 10px;
  background-color: pink;
  color: black;
  font-size: 13px;
}

.summary {
  margin-bottom: 10px;
}

.percent {
  font-size: 22px;
  line-height: 1.4;
}

.groupLabel {
  margin-top: 10px;
  font-weight: 500;
}

.row-tag {
  display: flex;
  justify-content: space-between;
  padding: 1px 6px;
  border-radius: 4px;
  cursor: pointer;
}

.row-tag:hover {
  background-color: rgba(255, 255, 255, 0.6);
}

.row-tag.empty {
  color: #b00020;
}

.row-tag.active {
  background-color: var(--q-primary);
  color: white;
}
</style>
