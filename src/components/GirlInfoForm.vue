<template>
  <div class="formBody">
    <div class="row">
      <div class="infoBlock baseInfo">
        <q-bar class="bg-primary">Base informations</q-bar>
        <q-input v-model="first_name" label="First Name" @change="onChange" />
        <q-input v-model="last_name" label="Last Name" @change="onChange" />
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: Object
  },
  emits: ['change', 'update:modelValue'],
  data: function () {
    return {
      first_name: "",
      last_name: ""
    }
  },
  methods: {
    onChange() {
      this.$emit('update:modelValue', {
        first_name: this.first_name,
        last_name: this.last_name
      });
      this.$emit('change');
    },
    load(girlObject) {
      this.first_name = girlObject.first_name;
      this.last_name = girlObject.last_name;
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