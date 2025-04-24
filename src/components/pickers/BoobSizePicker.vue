<template>
  <div class="pickerBody">
    <q-bar class="bg-primary">Boob size</q-bar>
    <div class="selectRow">
      <div v-for="(o, i) in options" :key="i" class="vignette" :class="{ 'active': o == boobPicked }" @click="selectValue(o)">
        <img :src="'/img/boobs/' + o + '.png'">
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
      boobPicked: '',
      options: ['small_boobs', 'average_boobs', 'big_boobs']
    }
  },
  methods: {
    selectValue(v) {
      this.boobPicked = v
      this.$emit('update:modelValue', this.boobPicked)
    }
  },
  watch: {
    modelValue(newV) {
      this.boobPicked = newV
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
}

.vignette.active {
  outline: rgb(255, 34, 71) solid 5px;
}

.q-bar {
  margin-bottom: 1vh;
}
</style>