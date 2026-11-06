<template>
  <div ref="root" class="thumb" :class="{ selected, wrong: file.needsConversion }" :title="file.name" @mouseenter="play" @mouseleave="pause">
    <template v-if="shown && !failed">
      <img v-if="file.kind === 'image'" :src="file.url" :alt="file.name" decoding="async" @error="failed = true">
      <video v-else ref="video" :src="file.url" preload="metadata" muted loop @error="failed = true"></video>
    </template>
    <q-icon v-if="failed" name="image_not_supported" size="2em" class="fallback" />
    <q-icon v-if="file.kind === 'video'" name="movie" class="corner kind" />
    <q-icon v-if="selected" name="check_circle" color="primary" size="sm" class="corner tick" />
    <span v-if="file.needsConversion" class="format">convert</span>
    <div v-if="file.busy" class="overlay">
      <q-spinner color="white" size="2em" />
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    file: Object,
    selected: Boolean
  },
  data() {
    return {
      shown: false,
      failed: false
    }
  },
  watch: {
    'file.url'() {
      this.failed = false
    }
  },
  mounted() {
    // Media are only loaded once they scroll into view.
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.shown = true
        this.observer.disconnect()
      }
    }, { rootMargin: '300px' })
    this.observer.observe(this.$refs.root)
  },
  beforeUnmount() {
    this.observer.disconnect()
  },
  methods: {
    play() {
      this.$refs.video?.play().catch(() => {})
    },
    pause() {
      this.$refs.video?.pause()
    }
  }
})
</script>
<style lang="css" scoped>
.thumb {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 6px;
  background-color: #e8e8e8;
  cursor: pointer;
  user-select: none;
}

.thumb img,
.thumb video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.thumb.selected {
  outline: var(--q-primary) solid 3px;
  outline-offset: -1px;
}

.thumb.wrong:not(.selected) {
  outline: red solid 2px;
  outline-offset: -1px;
}

.fallback {
  position: absolute;
  inset: 0;
  margin: auto;
  color: #777;
}

.corner {
  position: absolute;
  top: 4px;
  border-radius: 50%;
  background-color: white;
}

.kind {
  left: 4px;
  padding: 2px;
  color: black;
}

.tick {
  right: 4px;
}

.format {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(200, 0, 0, 0.8);
  color: white;
  font-size: 12px;
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
