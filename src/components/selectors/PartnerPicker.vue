<template>
  <div class="pickerBody">
    <q-bar class="bg-primary">Special partners</q-bar>
    <div class="selectRow">
      <div v-for="(o, i) in options" :key="i" class="vignette" :class="{ 'active': o == partnerPicked || (o == 'none' && partnerPicked == '') }" @click="selectValue(o)">
        <img :src="'/img/partner/' + o + '.png'">
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
      partnerPicked: '',
      options: ['none', 'lesbian', 'bisexual', 'group', 'big', 'beast', 'machine', 'monster']
    }
  },
  methods: {
    selectValue(v) {
      if (v === 'none') {
        this.partnerPicked = ''
      } else {
        this.partnerPicked = v
      }
      this.$emit('update:modelValue', this.partnerPicked)
    },
    parse(name) {
      return this.options.find(o => name.split(o).length > 1)
    }
  },
  watch: {
    modelValue(newV) {
      this.partnerPicked = newV
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.vignette {
  border-radius: 1vh;
  overflow: hidden;
  margin: 0 0.3vw;
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