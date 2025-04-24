<template>
  <div class="pickerBody">
    <q-bar class="bg-primary">Hair color</q-bar>
    <div class="selectRow">
      <div v-for="(o, i) in options" :key="i" class="vignette" :class="{ 'active': o == hairPicked }" @click="selectValue(o)">
        <img :src="'/img/hair/' + o + '.jpg'">
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
      hairPicked: '',
      options: ['white_hair', 'blonde_hair', 'red_hair', 'auburn_hair', 'brown_hair', 'black_hair', 'colored_hair']
    }
  },
  methods: {
    selectValue(v) {
      this.hairPicked = v
      this.$emit('update:modelValue', this.hairPicked)
    }
  },
  watch: {
    modelValue(newV) {
      this.hairPicked = newV
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
  max-width: 4vw;
}

.vignette.active {
  outline: rgb(255, 34, 71) solid 5px;
}

.q-bar {
  margin-bottom: 1vh;
}
</style>