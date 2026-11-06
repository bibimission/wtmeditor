<template>
  <div class="media" :class="{ wrong: file.needsConversion }" @click="onClick">
    <img v-if="file.kind === 'image'" :src="file.url" :alt="file.name" @error="failed = true">
    <video v-else :src="file.url" muted loop autoplay @error="failed = true"></video>
    <div v-if="failed" class="message">No preview for this format</div>
    <div v-if="file.needsConversion && !file.busy" class="message">Badly supported by the game, click to convert</div>
    <div v-if="file.busy" class="overlay">
      <q-spinner color="white" size="3em" />
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    file: Object
  },
  emits: ['convert'],
  data() {
    return {
      failed: false
    }
  },
  watch: {
    'file.url'() {
      this.failed = false
    }
  },
  methods: {
    onClick() {
      if (this.file.needsConversion) {
        this.$emit('convert')
      }
    }
  }
})
</script>
<style lang="css" scoped>
.media {
  position: relative;
  width: 100%;
  height: 100%;
}

.media img,
.media video {
  display: block;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
}

.wrong {
  outline: 3px red solid;
  cursor: pointer;
}

.message {
  position: absolute;
  inset: 0;
  margin: auto;
  width: fit-content;
  height: fit-content;
  padding: 0.5vh 1vw;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-weight: bold;
  text-align: center;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
