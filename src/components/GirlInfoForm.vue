<template>
  <div class="formBody">
    <div class="row">
      <div class="infoBlock baseInfo">
        <q-bar class="bg-primary">Base informations</q-bar>
        <q-input v-model="first_name" label="First Name" @change="onChange" />
        <q-input v-model="last_name" label="Last Name" @change="onChange" />
        <q-input v-model="modder" label="Modder Name" @change="onChange" />
      </div>
      <div class="infoBlock hairPicker">
        <HairColorPicker v-model="hair_color" @update:modelValue="onChange"></HairColorPicker>
      </div>
      <div class="infoBlock eyePicker">
        <EyeColorPicker v-model="eyes_color" @update:modelValue="onChange"></EyeColorPicker>
      </div>
    </div>

    <div class="row">
      <div class="areaBlock infoBlock">
        <q-bar class="bg-primary">Area sensitivity</q-bar>
        <div class="areaSelect">
          <label>Mouth</label>
          <q-slider :min="0.75" :max="1.5" :step="0.01" label label-always v-model="area_sensitivity.mouth" @change="onChange" />
        </div>
        <div class="areaSelect">
          <label>Boobs</label>
          <q-slider :min="0.75" :max="1.5" :step="0.01" label label-always v-model="area_sensitivity.boobs" @change="onChange" />
        </div>
        <div class="areaSelect">
          <label>Pussy</label>
          <q-slider :min="0.75" :max="1.5" :step="0.01" label label-always v-model="area_sensitivity.pussy" @change="onChange" />
        </div>
        <div class="areaSelect">
          <label>Ass</label>
          <q-slider :min="0.75" :max="1.5" :step="0.01" label label-always v-model="area_sensitivity.ass" @change="onChange" />
        </div>
        <div class="areaSelect">
          <label>Legs</label>
          <q-slider :min="0.75" :max="1.5" :step="0.01" label label-always v-model="area_sensitivity.legs" @change="onChange" />
        </div>
      </div>

      <div class="infoBlock">
        <BoobSizePicker v-model="boob_size" @update:modelValue="onChange"></BoobSizePicker>
      </div>
    </div>

    <div class="infoBLock">
      <q-bar class="bg-primary">Other traits</q-bar>
      <q-select v-model="traits" label="Traits" @update:model-value="onChange" multiple :options="traitsOptions" use-input use-chips input-debounce="0"></q-select>
    </div>

  </div>
</template>
<script>
import { defineComponent } from 'vue'
import HairColorPicker from './selectors/HairColorPicker.vue';
import EyeColorPicker from './selectors/EyeColorPicker.vue';
import BoobSizePicker from './selectors/BoobSizePicker.vue';

export default defineComponent({
  props: {
    modelValue: Object
  },
  components: {
    HairColorPicker,
    EyeColorPicker,
    BoobSizePicker
  },
  emits: ['change', 'update:modelValue'],
  data: function () {
    return {
      traitsOptions: [
        {
          label: 'Status',
          value: '',
          disable: true,
        },
        'mother',
        {
          label: 'Race',
          value: '',
          disable: true,
        },
        'asian', 'black', 'latina',
        {
          label: 'Cash flow',
          value: '',
          disable: true,
        },
        'modest', 'rich', 'broke',
        {
          label: 'Intellect',
          value: '',
          disable: true,
        },
        'dumb', 'sharp', 'brillant',
        {
          label: 'Sexual',
          value: '',
          disable: true,
        },
        'squirter', 'horny', 'naturist', 'onanist', 'nympho',
        {
          label: 'Traits',
          value: '',
          disable: true,
        },
        'famous',
        'noble', 'magnetic',
        'emotional', 'photogenic',
        'athletic',
        'obedient', 'provocative',
        'stressed', 'rebellious', 'cold', 'secretive', 'honest',
        {
          label: 'Sex title',
          value: '',
          disable: true,
        },
        'conservative', 'reserved', 'slut', 'whore', 'ultimate_whore',
        {
          label: 'Sex achievements',
          value: '',
          disable: true,
        },
        'cum_slut', 'cum_dumpster', 'anal_slut'
      ],
      first_name: "",
      last_name: "",
      traits: [],
      modder: "",
      hair_color: '',
      eyes_color: '',
      boob_size: '',
      area_sensitivity: {
        boobs: 1,
        pussy: 1,
        ass: 1,
        legs: 1,
        mouth: 1,
      }
    }
  },
  methods: {
    onChange() {
      const finalTraits = this.traits.concat([this.hair_color, this.eyes_color, this.boob_size])
      this.$emit('update:modelValue', {
        first_name: this.first_name,
        last_name: this.last_name,
        traits: finalTraits.filter((e) => { return e != '' }),
        modder: this.modder,
        area_sensitivity: this.area_sensitivity
      });
      this.$emit('change');
    },
    load(girlObject) {
      this.first_name = girlObject.first_name;
      this.last_name = girlObject.last_name;
      this.modder = girlObject.modder;
      if (girlObject.area_sensitivity != undefined) {
        this.area_sensitivity = girlObject.area_sensitivity;
      }
      let tmpTraits = girlObject.traits.filter(t => t != null);
      this.hair_color = tmpTraits.find(i => i.split('_hair').length > 1)
      this.boob_size = tmpTraits.find(i => i.split('_boobs').length > 1)
      this.eyes_color = tmpTraits.find(i => i.split('_eyes').length > 1)
      let finalTraits = tmpTraits.filter(i => i.split('_eyes').length == 1 && i.split('_hair').length == 1 && i.split('_boobs').length == 1)
      this.traits = finalTraits
    }
  },
  mounted() {
    this.load(this.modelValue)
  }
})
</script>
<style lang="css" scoped>
.formBody {
  display: flex;
  flex-direction: column;
}

.row {
  justify-content: space-between;
}

.q-bar {
  margin-bottom: 1vh;
}

.infoBlock {
  display: inline-block;
  border-radius: 5px;
  padding: 0 2vw 2vh 2vw;
  border: solid 2px rgb(185, 185, 185);
  margin-bottom: 2vh;
}

.baseInfo {
  width: 20vw;
}

.areaSelect {
  color: black;
}

.areaBlock {
  width: 30vw;
}
</style>