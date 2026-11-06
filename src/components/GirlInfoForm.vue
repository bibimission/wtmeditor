<template>
  <div class="formBody">
    <q-banner v-if="state.infos.needsRepair" dense class="bg-orange text-white">
      The game ignores the names of this _BK.ini because they have no quotes.
      <template #action>
        <q-btn flat label="Repair" @click="save" />
      </template>
    </q-banner>
    <div class="infoBlock">
      <q-bar class="bg-primary">Base informations</q-bar>
      <q-input v-model="firstName" label="First Name" :disable="!state.girl" @change="save" />
      <q-input v-model="lastName" label="Last Name" :disable="!state.girl" @change="save" />
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
import { usePack } from 'src/composables/usePack'

export default defineComponent({
  setup() {
    const { state, saveInfos } = usePack()
    return { state, saveInfos }
  },
  data() {
    return {
      firstName: '',
      lastName: ''
    }
  },
  watch: {
    'state.infos': {
      immediate: true,
      handler(infos) {
        this.firstName = infos.first_name
        this.lastName = infos.last_name
      }
    }
  },
  methods: {
    save() {
      this.saveInfos({ first_name: this.firstName, last_name: this.lastName })
    }
  }
})
</script>
<style lang="css" scoped>
.formBody {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  color: black;
}

.q-bar {
  color: white;
  margin-bottom: 1vh;
}

.infoBlock {
  width: 20vw;
  border-radius: 5px;
  padding: 0 2vw 2vh 2vw;
  border: solid 2px rgb(185, 185, 185);
}
</style>
