<template>
  <div class="pickerBody">
    <q-bar class="bg-primary">Girl outfit</q-bar>
    <div class="selectRow">
      <div v-for="(o, i) in options" :key="i" class="vignette" :class="{ 'active': o == outfitPicked || (o == 'none' && outfitPicked == '') }" @click="selectValue(o)">
        <img :src="'/img/outfit/' + o + '.png'">
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
      outfitPicked: '',
      options: ['none', 'naked', 'cosplay', 'maid', 'bunny', 'swim', 'kimono', 'bondage']
    }
  },
  methods: {
    selectValue(v) {
      if (v === 'none') {
        this.outfitPicked = ''
      } else {
        this.outfitPicked = v
      }
      this.$emit('update:modelValue', this.outfitPicked)
    },
    parse(name) {
      return this.options.find(o => name.split(o).length > 1)
    }
  },
  watch: {
    modelValue(newV) {
      this.outfitPicked = newV
    }
  }
}
</script>
<style lang="css" scoped>
.pickerBody {
  width: fit-content;
  height: fit-content;
  max-width: 20vw;
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
  height: auto;
}

.vignette.active {
  outline: rgb(255, 34, 71) solid 5px;
}

.q-bar {
  margin-bottom: 1vh;
}
</style>