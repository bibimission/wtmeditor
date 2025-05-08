<template>
  <div>
    <q-bar class="bg-primary">Other People</q-bar>
    <div class="peopleSelector">
      <div v-for="(o, i) in partyOptions" :key="i" class="peopleOption" @click="toggleParty(o)" :class="{ 'active': activeParties.includes(o.value) }">
        <img :src="'/img/people/' + o.img">
      </div>
    </div>
    <div>
      <q-bar class="bg-primary">Action</q-bar>
      <div>
        <q-select label="Mouth" :options="computeMouthOptions" v-model="mouthAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Boobs" :options="computeBoobsOptions" v-model="boobsAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Hands" :options="computeHandsOptions" v-model="handsAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Pussy" :options="computePussyOptions" v-model="pussyAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Ass" :options="computeAssOptions" v-model="assAction" clearable @update:model-value="onChange"></q-select>
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
  emits: ['update:modelValue'],
  data() {
    return {
      partyOptions: [
        { label: 'Alone', value: '', img: 'none.png' },
        { label: 'Woman', value: 'tp_fem', img: 'woman.png' },
        { label: 'Man', value: 'tp_male', img: 'man.png' },
        { label: 'Women', value: 'group_female', img: 'women.png' },
        { label: 'Men', value: 'group_male', img: 'men.png' },
        { label: 'Group', value: 'orgy', img: 'group.png' }
      ],
      // Bodyparts actions
      mouthOptions: [
        { label: 'Suck dildo', value: 'dildo_oral_self', tp: '' },
        { label: 'Kiss', value: 'kiss', tp: 'F/M' },
        { label: 'Give Oral', value: 'give_oral', tp: 'F/M' },
        { label: 'Facefuck', value: 'face_fuck', tp: 'M' },
        { label: 'Multiple Oral', value: 'multi_oral', tp: 'F/M' },
        { label: 'Rimjob', value: 'give_rimjob', tp: 'F/M' },
        { label: 'Cumshot', value: 'cumshot_face', tp: 'M' },
        { label: 'Creampie', value: 'creampie_mouth', tp: 'M' },
      ],
      boobsOptions: [
        { label: 'Play with boobs', value: 'play_boob', tp: '' },
        { label: 'Play with nipples', value: 'play_nipple', tp: '' },
        { label: 'Boobjob', value: 'boob_fuck', tp: 'M' },
        { label: 'Cumshot', value: 'cumshot_boobs', tp: 'M' }
      ],
      handsOptions: [
        { label: 'Strip', value: 'undress_self', tp: '' },
        { label: 'Strip partner', value: 'give_undress', tp: 'F/M' },
        { label: 'Finger pussy', value: 'finger_pussy_self', tp: '' },
        { label: 'Finger ass', value: 'finger_ass_self', tp: '' },
        { label: 'Finger partner pussy', value: 'give_finger_pussy', tp: 'F' },
        { label: 'Finger partner ass', value: 'give_finger_ass', tp: 'F' },
        { label: 'Handjob', value: 'give_handjob', tp: 'M' },
      ],
      pussyOptions: [
        { label: 'Dildo', value: 'dildo_pussy_self', tp: '' },
        { label: 'Dildoed', value: 'get_dildo_pussy', tp: 'F/M' },
        { label: 'Show', value: 'show_pussy', tp: '' },
        { label: 'Get licked', value: 'get_oral', tp: 'F/M' },
        { label: 'Get Fingered', value: 'get_finger_pussy', tp: 'F/M' },
        { label: 'Fuck', value: 'vaginal', tp: 'M' },
        { label: 'Cumshot', value: 'cumshot_pussy', tp: 'M' },
        { label: 'Creampie', value: 'creampie_pussy', tp: 'M' },
      ],
      assOptions: [
        { label: 'Dildo', value: 'dildo_anal_self', tp: '' },
        { label: 'Dildoed', value: 'get_dildo_anal', tp: 'F/M' },
        { label: 'Show', value: 'show_ass', tp: '' },
        { label: 'Get licked', value: 'get_rimjob', tp: 'F/M' },
        { label: 'Get Fingered', value: 'get_finger_ass', tp: 'F/M' },
        { label: 'Fuck', value: 'anal', tp: 'M' },
        { label: 'Cumshot', value: 'cumshot_ass', tp: 'M' },
        { label: 'Creampie', value: 'creampie_ass', tp: 'M' },
      ],

      // Values
      activeParties: [''],
      mouthAction: null,
      boobsAction: null,
      handsAction: null,
      pussyAction: null,
      assAction: null,
    }
  },
  computed: {
    malePresent() {
      return this.activeParties.includes('tp_male') || this.activeParties.includes('group_male') || this.activeParties.includes('orgy')
    },
    femalePresent() {
      return this.activeParties.includes('tp_fem') || this.activeParties.includes('group_female') || this.activeParties.includes('orgy')
    },
    computeMouthOptions() {
      return this.mouthOptions.filter((o) => { return o.tp === '' || (this.malePresent ? o.tp.split('M').length > 1 : false) || (this.femalePresent ? o.tp.split('F').length > 1 : false) })
    },
    computeHandsOptions() {
      return this.handsOptions.filter((o) => { return o.tp === '' || (this.malePresent ? o.tp.split('M').length > 1 : false) || (this.femalePresent ? o.tp.split('F').length > 1 : false) })
    },
    computeBoobsOptions() {
      return this.boobsOptions.filter((o) => { return o.tp === '' || (this.malePresent ? o.tp.split('M').length > 1 : false) || (this.femalePresent ? o.tp.split('F').length > 1 : false) })
    },
    computePussyOptions() {
      return this.pussyOptions.filter((o) => { return o.tp === '' || (this.malePresent ? o.tp.split('M').length > 1 : false) || (this.femalePresent ? o.tp.split('F').length > 1 : false) })
    },
    computeAssOptions() {
      return this.assOptions.filter((o) => { return o.tp === '' || (this.malePresent ? o.tp.split('M').length > 1 : false) || (this.femalePresent ? o.tp.split('F').length > 1 : false) })
    }
  },
  methods: {
    toggleParty(p) {
      if (p.value === '') {
        this.activeParties = ['']
      } else {
        this.activeParties = this.activeParties.filter((o) => o !== '')
        if (this.activeParties.filter((o) => o == p.value).length > 0) {
          this.activeParties = this.activeParties.filter((o) => o !== p.value)
        } else {
          this.activeParties.push(p.value)
        }
      }
      this.onChange()
    },
    onChange() {
      var totalTags = []
      if (this.activeParties[0] !== '') {
        totalTags = this.activeParties
      }
      if (this.mouthAction != null) {
        totalTags.push(this.mouthAction.value)
      }
      if (this.boobsAction != null) {
        totalTags.push(this.boobsAction.value)
      }
      if (this.handsAction != null) {
        totalTags.push(this.handsAction.value)
      }
      if (this.pussyAction != null) {
        totalTags.push(this.pussyAction.value)
      }
      if (this.assAction != null) {
        totalTags.push(this.assAction.value)
      }
      this.$emit('update:modelValue', totalTags)
    },
    parse(tokens) {
      return tokens.filter(t =>
        (this.partyOptions.find(o => o.value === t) != null) ||
        (this.mouthOptions.find(o => o.value === t) != null) ||
        (this.boobsOptions.find(o => o.value === t) != null) ||
        (this.handsOptions.find(o => o.value === t) != null) ||
        (this.pussyOptions.find(o => o.value === t) != null) ||
        (this.assOptions.find(o => o.value === t) != null)
      )
    }
  },
  watch: {
    modelValue(newV) {
      this.activeParties = []
      var activePartiesVals = this.partyOptions.filter(t => newV.includes(t.value))
      if (activePartiesVals.length == 0) {
        this.activeParties.push('')
      } else {
        activePartiesVals.forEach((v) => {
          this.activeParties.push(v.value)
        })
      }

      this.mouthAction = this.mouthOptions.find(t => newV.includes(t.value))
      this.boobsAction = this.boobsOptions.find(t => newV.includes(t.value))
      this.handsAction = this.handsOptions.find(t => newV.includes(t.value))
      this.pussyAction = this.pussyOptions.find(t => newV.includes(t.value))
      this.assAction = this.assOptions.find(t => newV.includes(t.value))
    }
  }
}
</script>
<style lang="css" scoped>
.peopleSelector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-column-gap: 0.5vw;
}

.peopleOption {
  background-color: white;
  border-radius: 2vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5vh;
  cursor: pointer;
}

.peopleOption.active {
  outline: darkmagenta solid 2px;
}
</style>