<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="missingCard">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Tags without media</div>
      </q-card-section>
      <q-card-section class="missingBody">
        <p v-if="groups.length === 0">Every tag has at least one media in this pack.</p>
        <div v-for="g in groups" :key="g.id" class="missingGroup">
          <div class="text-weight-bold">{{ g.label }}</div>
          <q-chip v-for="o in g.options" :key="o.tag" dense square>{{ o.label }}</q-chip>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat color="primary" label="Close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from 'vue'
import { usePack } from 'src/composables/usePack'
import { tagsOfTokens } from 'src/shared/tagCodec'
import { missingTags } from 'src/shared/tagSchema'

export default defineComponent({
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  setup() {
    return { state: usePack().state }
  },
  computed: {
    groups() {
      const present = this.state.files.flatMap((file) => tagsOfTokens(file.tokens))
      return missingTags(present)
    }
  }
})
</script>
<style lang="css" scoped>
.missingCard {
  width: 600px;
  max-width: 90vw;
}

.missingBody {
  max-height: 70vh;
  overflow-y: auto;
}

.missingGroup {
  margin-bottom: 1.5vh;
}
</style>
