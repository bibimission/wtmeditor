<template>
  <div>
    <div>
      <q-bar class="bg-primary">Action</q-bar>
      <div>
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
      // Bodyparts actions
      mouthOptions: [
        { label: 'Blowjob', value: 'BLOWJOB' },
        { label: 'Deepthroat', value: 'DEEPTHROAT' },
        { label: 'Blowbang', value: 'BLOWBANG' },
        { label: 'Cum in mouth', value: 'CUM_IN_MOUTH' },
        { label: 'Swallow cum', value: 'SWALLOW_CUM' },
        { label: 'Cumshot', value: 'CUMSHOT' },
        { label: 'Ball licking', value: 'BALL_LINCKING' },
        { label: 'Bukkake', value: 'BUKKAKE' },
        { label: 'Orgasm', value: 'FEMALE_ORGASM' },
        { label: 'Call Boyfriend', value: 'CALL_BOYFRIEND' },
        { label: 'Double female blowjob', value: 'DOUBLE_FEMALE_BLOWJOB' },
        { label: 'Female Cunilingus', value: 'FEMALE_CUNNILINGUS' },
        { label: 'Female Kissing', value: 'KISSING_PENIS' },
        { label: 'Rimjob', value: 'RIMJOB' },
        { label: 'Gargle cum', value: 'GARGLE_CUM' },
      ],
      boobsOptions: [
        { label: 'Titjob', value: 'TITJOB' },
      ],
      handsOptions: [
        { label: 'Handjob', value: 'HANDJOB' },
        { label: 'Footjob', value: 'FOOTJOB' }
      ],
      pussyOptions: [
        { label: 'Fuck', value: 'VAGINAL' },
        { label: 'Spitroast', value: 'VAGINAL_SPITROAST' },
        { label: 'Dp', value: 'DOUBLE_PENETRATION' },
        { label: 'Airtight', value: 'AIRTIGHT' },
        { label: 'Five on one', value: 'FIVE_ON_ONE' },
        { label: 'Creampie', value: 'VAGINAL_CREAMPIE' },
        { label: 'Squirt', value: 'SQUIRTING' },
        { label: 'Cunnilingus', value: 'CUNNILINGUS' },
        { label: 'Double vaginal', value: 'DOUBLE_VAGINAL' },
        { label: 'Two girls Double vaginal', value: 'FEMALE_TWO_GIRLS_VAGINAL' },
        { label: 'Two girls Spitroast', value: 'FEMALE_TWO_GIRLS_SPITROAST' },
        { label: 'Bound Spitroast', value: 'BOUND_SPITROAST' },
      ],
      assOptions: [
        { label: 'Fuck', value: 'ANAL' },
        { label: 'Creampie', value: 'ANAL_CREAMPIE' },
        { label: 'Prone bone', value: 'PRONE_BONE' },
        { label: 'Anal Spitroast', value: 'ANAL_SPITROAST' },
        { label: 'Double Anal', value: 'DOUBLE_ANAL' },
      ],

      // Values

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
    parseTags(tags, setValue = true) {
      var mouth = this.mouthOptions.find(t => tags.includes(t.value))
      var boobs = this.boobsOptions.find(t => tags.includes(t.value))
      var hands = this.handsOptions.find(t => tags.includes(t.value))
      var pussy = this.pussyOptions.find(t => tags.includes(t.value))
      var ass = this.assOptions.find(t => tags.includes(t.value))
      if (setValue) {
        this.mouthAction = mouth
        this.boobsAction = boobs
        this.handsAction = hands
        this.pussyAction = pussy
        this.assAction = ass
      } else {
        var totalTags = []
        if (mouth != null) {
          totalTags.push(mouth.value)
        }
        if (boobs != null) {
          totalTags.push(boobs.value)
        }
        if (hands != null) {
          totalTags.push(handsvalue)
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
      this.parseTags(newV)
    }
  }
}
</script>
<style lang="css" scoped></style>