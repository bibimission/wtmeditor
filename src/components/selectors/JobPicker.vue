<template>
  <div class="pickerBody">
    <q-bar class="bg-primary">Girl job</q-bar>
    <div class="selectRow">
      <div v-for="(o, i) in options" :key="i" class="vignette" :class="{ 'active': o == jobPicked || (o == 'none' && jobPicked == '') }" @click="selectValue(o)">
        <img :src="'/img/job/' + o + '.png'">
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
      jobPicked: '',
      options: ['none', 'waitress', 'dancer', 'masseuse', 'geisha']
    }
  },
  methods: {
    selectValue(v) {
      if (v === 'none') {
        this.jobPicked = ''
      } else {
        this.jobPicked = v
      }
      this.$emit('update:modelValue', this.jobPicked)
    },
    parse(name) {
      return this.options.find(o => name.split(o).length > 1)
    }
  },
  watch: {
    modelValue(newV) {
      this.jobPicked = newV
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
  background-color: white;
}

.vignette img {
  display: block;
  max-width: 3vw;
}

.vignette.active {
  outline: rgb(255, 34, 71) solid 5px;
}

.q-bar {
  margin-bottom: 1vh;
}
</style>