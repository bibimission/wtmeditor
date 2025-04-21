<template>
  <div class="pickerBody">
    <q-bar class="bg-primary">Girl Mood</q-bar>
    <div class="selectRow">
      <div v-for="(o, i) in options" :key="i" class="vignette" :class="{ 'active': o == moodPicked }" @click="selectValue(o)">
        <img :src="'/img/mind/' + o + '.jpeg'">
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  data() {
    return {
      moodPicked: '',
      options: ['conservative', 'reserved', 'slut', 'whore', 'ultimate_whore']
    }
  },
  methods: {
    selectValue(v) {
      this.moodPicked = v
      this.$emit('update:modelValue', this.moodPicked)
    },
    parse(tags) {
      return this.options.find(o => tags.includes(o))
    }
  },
  watch: {
    modelValue(newV) {
      this.moodPicked = newV
    }
  }
}
</script>
<style lang="css" scoped>
.pickerBody {
  width: fit-content;
  height: fit-content;
}

.selectRow {
  display: flex;
  justify-content: center;
}

.vignette {
  border-radius: 1vh;
  overflow: hidden;
  margin: 0 0.3vw;
}

.vignette img {
  display: block;
  max-width: 5vw;
}

.vignette.active {
  outline: rgb(255, 34, 71) solid 5px;
}

.q-bar {
  margin-bottom: 1vh;
}
</style>