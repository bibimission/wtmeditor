<template>
  <div>
    <q-bar class="bg-primary">Clothing (Right click for strip action)</q-bar>
    <div>Top</div>
    <div class="clothesRow">
      <div v-for="(top, i) in topOptions" :key="i" @click="onClick(top, 'top')" @contextmenu.prevent="onRightClick(top, 'top')" class="clothesButt" :class="{ 'strip': stripAction == top, 'wearing': selectedClothes.top.includes(top) }">
        <img :src="'/img/clothes/' + top + '.png'">
      </div>
    </div>
    <div>Bottom</div>
    <div class="clothesRow">
      <div v-for="(bot, i) in bottomOptions" :key="i" @click="onClick(bot, 'bottom')" @contextmenu.prevent="onRightClick(bot, 'bottom')" class="clothesButt" :class="{ 'strip': stripAction == bot, 'wearing': selectedClothes.bottom.includes(bot) }">
        <img :src="'/img/clothes/' + bot + '.png'">
      </div>
    </div>
    <div>Fet</div>
    <div class="clothesRow">
      <div v-for="(feet, i) in feetOptions" :key="i" @click="onClick(feet, 'feet')" @contextmenu.prevent="onRightClick(feet, 'feet')" class="clothesButt" :class="{ 'strip': stripAction == feet, 'wearing': selectedClothes.feet.includes(feet) }">
        <img :src="'/img/clothes/' + feet + '.png'">
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: Array,
      default: () => { return [] }
    }
  },
  emits: ['update:modelValue', 'change', 'stripAction'],
  data() {
    return {
      topOptions: [
        'none', 'outer', 'bra', 'leotard', 'shirt', 'dress'
      ],
      bottomOptions: [
        'none', 'panties', 'skirt', 'shorts', 'jeans', 'leggings'
      ],
      feetOptions: [
        'none', 'socks', 'stockings', 'shoes', 'heels'
      ],
      globalOptions: [
        'bare', 'clothed', 'nobot', 'notop'
      ],
      selectedClothes: {
        top: [],
        bottom: [],
        feet: []
      },
      stripAction: ''
    }
  },
  methods: {
    onClick(clothes, region) {
      if (clothes != 'none' && clothes != 'unset') {
        this.selectedClothes[region] = this.selectedClothes[region].filter(t => t != 'none' && t != 'unset')
        if (this.selectedClothes[region].includes(clothes)) {
          this.selectedClothes[region] = this.selectedClothes[region].filter(c => c != clothes)
        } else {
          this.selectedClothes[region].push(clothes)
        }
      } else {
        this.selectedClothes[region] = [clothes]
      }
      this.onChange()
    },
    onRightClick(clothes, region) {
      if (clothes != 'none' && clothes != 'unset') {
        if (this.stripAction == clothes) {
          this.stripAction = ''
        } else {
          this.stripAction = clothes
        }
        this.$emit('stripAction', this.stripAction)
      }
    },
    onChange() {
      var tops = this.selectedClothes.top
      var bots = this.selectedClothes.bottom
      var feet = this.selectedClothes.feet

      var nakedTop = tops.find(t => t == 'none')
      var nakedBot = bots.find(t => t == 'none')

      if (nakedBot && nakedTop) {
        this.$emit('update:modelValue', ['bare'])
      } else if (nakedBot) {
        this.$emit('update:modelValue', ['nobot'])
      } else if (nakedTop) {
        this.$emit('update:modelValue', ['notop'])
      } else {
        this.$emit('update:modelValue', tops.concat(bots.concat(feet)))
      }
    },
    parseTags(tags, setValue = true) {
      var tops = this.topOptions.filter(o => tags.includes(o))
      var bots = this.bottomOptions.filter(o => tags.includes(o))
      var feets = this.feetOptions.filter(o => tags.includes(o))
      var global = this.globalOptions.filter(o => tags.includes(o))

      this.stripAction = ''

      var stripOrder = tags.find(t => t.split('strip_').length > 1)
      if (stripOrder != null) {
        this.stripAction = stripOrder.split('_')[1]
      }
      if (global.length > 0) {

        if (global.includes('notop')) {
          tops = ['none']
        }
        if (global.includes('nobot')) {
          bots = ['none']
          feets = ['none']
        }
        if (global.includes('bare')) {
          tops = ['none']
          bots = ['none']
          feets = ['none']
        }
      }
      if (setValue) {
        this.selectedClothes.top = tops
        this.selectedClothes.bottom = bots
        this.selectedClothes.feet = feets
      } else {
        return tops.concat(bots.concat(feets))
      }
    }
  },
  watch: {
    modelValue(newV) {
      this.parseTags(newV)
    }
  },
  mounted() {
    this.parseTags(this.modelValue)
  }
}
</script>
<style>
.clothesRow {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.clothesButt {
  background-color: white;
  border-radius: 5px;
  margin: 0.5vh 0.5vw;
  position: relative;
}

.clothesButt.wearing {
  outline: darkmagenta solid 3px;
}

.clothesButt.strip {
  border: orange solid 2px;
}

.clothesButt.strip::after {
  position: absolute;
  width: 100%;
  height: 100%;
  content: '';
  margin: auto;
  top: 0;
  left: 0;
  background-color: orange;
  opacity: 0.4;
}
</style>