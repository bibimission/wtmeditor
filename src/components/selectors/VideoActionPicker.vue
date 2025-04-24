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
        { label: 'Kiss', value: 'kissing' },
        { label: 'Orgasm', value: 'orgasm' },
        { label: 'Facefuck', value: 'useface' },
        { label: 'Cumshot', value: 'facial' },
      ],
      boobsOptions: [
        { label: 'Get Groped', value: 'gropeboob' },
        { label: 'Get Pinched', value: 'pinch' },
        { label: 'Get Slapped', value: 'slapboobs' },
      ],
      handsOptions: [
        { label: 'Masturbate', value: 'masturbation' },
      ],
      pussyOptions: [
        { label: 'Get groped', value: 'gropepussy' },
        { label: 'Wedgie', value: 'wedgie' },
        { label: 'Inner thigh', value: 'innerthigh' },
        { label: 'Get teased', value: 'teaseclit' },
        { label: 'Get Fingered', value: 'fingerpussy' },
        { label: 'Get licked', value: 'lickpussy' },
        { label: 'Fuck', value: 'fuckpussy' },
        { label: 'Creampie', value: 'creampie_pussy' },
      ],
      assOptions: [
        { label: 'Get groped', value: 'gropeass' },
        { label: 'Get teased', value: 'teaseass' },
        { label: 'Get Spanked', value: 'spank' },
        { label: 'Get Slapped', value: 'slapass' },
        { label: 'Get Fingered', value: 'fingerass' },
        { label: 'Fuck', value: 'fuckass' },
        { label: 'Creampie', value: 'creampie_anal' },
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