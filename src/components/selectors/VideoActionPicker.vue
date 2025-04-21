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
        { label: 'Aroused reaction', value: 'girl_aroused_reaction' },
        { label: 'Kiss', value: 'kiss' },
        { label: 'Orgasm', value: 'orgasm' },
        { label: 'Blowjob', value: 'blowjob' },
        { label: 'Facefuck', value: 'use_mouth' },
        { label: 'Rimjob', value: 'rimjob' },
        { label: 'Cumshot', value: 'facial' },
        { label: 'Creampie', value: 'creampie_mouth' },
      ],
      boobsOptions: [
        { label: 'Get Groped', value: 'grope_boobs' },
        { label: 'Get Slapped', value: 'slap_boobs' },
        { label: 'Get Pinched', value: 'pinch_nipple' },
        { label: 'Boobjob', value: 'fuck_boobs' },
        { label: 'Cumshot', value: 'cumshot_boobs' }
      ],
      handsOptions: [
        { label: 'Finger pussy', value: 'masturbate' },
        { label: 'Handjob', value: 'handjob' },
        { label: 'Remove Buttplug', value: 'remove_buttplug' },
        { label: 'Insert Buttplug', value: 'insert_buttplug' },
      ],
      pussyOptions: [
        { label: 'Wedgie', value: 'wedgie' },
        { label: 'Get teased', value: 'tease_clit' },
        { label: 'Get groped', value: 'grope_pussy' },
        { label: 'Get Fingered', value: 'finger_pussy' },
        { label: 'Get licked', value: 'lick_pussy' },
        { label: 'Fuck', value: 'fuck_pussy' },
        { label: 'Cumshot', value: 'cumshot_pussy' },
        { label: 'Creampie', value: 'creampie_pussy' },
      ],
      assOptions: [
        { label: 'Get teased', value: 'tease_ass' },
        { label: 'Get groped', value: 'grope_ass' },
        { label: 'Get Slapped', value: 'slap_ass' },
        { label: 'Get Spanked', value: 'spank_ass' },
        { label: 'Get Fingered', value: 'get_finger_ass' },
        { label: 'Get licked', value: 'lick_ass' },
        { label: 'Fuck', value: 'fuck_ass' },
        { label: 'Cumshot', value: 'cumshot_ass' },
        { label: 'Creampie', value: 'creampie_ass' },
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