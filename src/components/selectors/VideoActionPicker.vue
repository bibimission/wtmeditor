<template>
  <div>
    <div>
      <q-bar class="bg-primary">Action</q-bar>
      <div>
        <q-select label="Global" :options="globalOptions" v-model="globalAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Mouth" :options="mouthOptions" v-model="mouthAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Boobs" :options="boobsOptions" v-model="boobsAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Hands" :options="handsOptions" v-model="handsAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Pussy" :options="pussyOptions" v-model="pussyAction" clearable @update:model-value="onChange"></q-select>
        <q-select label="Ass" :options="assOptions" v-model="assAction" clearable @update:model-value="onChange"></q-select>
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
      globalOptions: [
        { label: 'Strip', value: 'strip' },
        { label: 'Sing', value: 'sing' },
        { label: 'Fight', value: 'fight' },
        { label: 'Rest', value: 'rest' },
        { label: 'Libido training', value: 'libido' },
        { label: 'Sensitivity training', value: 'sensitivity' },
        { label: 'Obedience training', value: 'obedience' },
        { label: 'Constitution training', value: 'constitution' },
        { label: 'Watersports (pee)', value: 'watersports' },
      ],
      // Bodyparts actions
      mouthOptions: [
        { label: 'Kiss', value: 'kiss' },
        { label: 'Blowjob/Oral', value: 'service oral' },
        { label: 'Deepthroat', value: 'deep' },
        { label: 'Sixtynine', value: 'sixty-nine' },
        { label: 'Gag', value: 'gag' },
        { label: 'Rimjob', value: 'rimming' },
        { label: 'Cumshot', value: 'cumshot on-face' },
        { label: 'Cum in hair', value: 'cumshot in-hair' },
        { label: 'Creampie', value: 'cumshot in-mouth' },
        { label: 'Swallowing', value: 'cumshot swallowing' },
        { label: 'Bukkake', value: 'bukkake' },
        { label: 'Cum shower', value: 'cum-shower' },
        { label: 'Orgasm', value: 'orgasm' },
        { label: 'Denied Orgasm', value: 'denied' },
      ],
      boobsOptions: [
        { label: 'Fondle', value: 'fondle' },
        { label: 'Grope', value: 'grope' },
        { label: 'Titjob', value: 'titjob' },
        { label: 'Lactation', value: 'lactation' },
        { label: 'Cumshot', value: 'cumshot on-body' },
      ],
      handsOptions: [
        { label: 'Masturbate', value: 'masturbate' },
        { label: 'Handjob', value: 'service handjob' },
      ],
      pussyOptions: [
        { label: 'Fingering', value: 'finger' },
        { label: 'Dildo', value: 'dildo' },
        { label: 'Cunnilingus', value: 'cunnilingus' },
        { label: 'Doggy', value: 'sex doggy' },
        { label: 'Cowgirl', value: 'sex cowgirl' },
        { label: 'Missionary', value: 'sex missionary' },
        { label: 'Piledriver', value: 'sex piledriver' },
        { label: 'Spooning', value: 'sex spooning' },
        { label: 'DP', value: 'double' },
        { label: 'Fetish', value: 'fetish' },
        { label: 'Creampie', value: 'creampie' },
        { label: 'Squirt', value: 'squirt' },
      ],
      assOptions: [
        { label: 'Plug', value: 'plug' },
        { label: 'Fisting', value: 'fisting' },
        { label: 'Doggy', value: 'anal doggy' },
        { label: 'Cowgirl', value: 'anal cowgirl' },
        { label: 'Missionary', value: 'anal missionary' },
        { label: 'Piledriver', value: 'anal piledriver' },
        { label: 'Spooning', value: 'anal spooning' },
        { label: 'Creampie', value: 'creampie' },
      ],

      // Values

      globalAction: null,
      mouthAction: null,
      boobsAction: null,
      handsAction: null,
      pussyAction: null,
      assAction: null,
    }
  },
  methods: {
    onChange() {
      var totalTags = []
      if (this.globalAction != null) {
        totalTags.push(this.globalAction.value)
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
    parseTags(videoName, setValue = true) {
      var glob = this.globalOptions.find(t => videoName.split(t.value).length > 1)
      var mouth = this.mouthOptions.find(t => videoName.split(t.value).length > 1)
      var boobs = this.boobsOptions.find(t => videoName.split(t.value).length > 1)
      var hands = this.handsOptions.find(t => videoName.split(t.value).length > 1)
      var pussy = this.pussyOptions.find(t => videoName.split(t.value).length > 1)
      var ass = this.assOptions.find(t => videoName.split(t.value).length > 1)
      if (setValue) {
        this.globalAction = glob
        this.mouthAction = mouth
        this.boobsAction = boobs
        this.handsAction = hands
        this.pussyAction = pussy
        this.assAction = ass
      } else {
        var totalTags = []
        if (glob != null) {
          totalTags.push(glob.value)
        }
        if (mouth != null) {
          totalTags.push(mouth.value)
        }
        if (boobs != null) {
          totalTags.push(boobs.value)
        }
        if (hands != null) {
          totalTags.push(hands.value)
        }
        if (pussy != null) {
          totalTags.push(pussy.value)
        }
        if (ass != null) {
          totalTags.push(ass.value)
        }
        return totalTags
      }
    }
  },
  watch: {
    modelValue(newV) {
      this.parseTags(newV.join(' '))
    }
  }
}
</script>
<style lang="css" scoped></style>