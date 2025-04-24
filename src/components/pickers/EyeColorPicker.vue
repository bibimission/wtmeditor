<template>
  <div class="pickerBody">
    <q-bar class="bg-primary">Eyes color</q-bar>
    <div class="selectRow">
      <div v-for="(o, i) in options" :key="i" class="vignette" :class="{ 'active': o == eyePicked }" @click="selectValue(o)">
        <img :src="'/img/eyes/' + o + '.png'">
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
      eyePicked: '',
      options: ['grey_eyes', 'blue_eyes', 'green_eyes', 'hazel_eyes', 'brown_eyes']
    }
  },
  methods: {
    selectValue(v) {
      this.eyePicked = v
      this.$emit('update:modelValue', this.eyePicked)
    }
  },
  watch: {
    modelValue(newV) {
      this.eyePicked = newV
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