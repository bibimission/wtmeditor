<template>
    <div>
        <q-input v-model="first_name" label="First Name" @change="onChange" />
        <q-input v-model="last_name" label="Last Name" @change="onChange" />
        <q-select v-model="traits" label="Traits" @update:model-value="onChange" multiple :options="traitsOptions" use-input use-chips input-debounce="0"></q-select>
        <q-input v-model="source" label="Source" @change="onChange" />
        <q-input v-model="modder" label="Modder Name" @change="onChange" />
        <q-select v-model="sensitive_area" label="Sensitve Area" :options="sensitiveOptions" @update:model-value="onChange"></q-select>
    </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        modelValue: Object
    },
    mounted: function () {
        this.first_name = this.modelValue?.first_name,
            this.last_name = this.modelValue?.last_name,
            this.traits = this.modelValue?.traits,
            this.source = this.modelValue?.source,
            this.modder = this.modelValue?.modder,
            this.sensitive_area = this.modelValue?.sensitive_area
    },
    emits: ['change', 'update:modelValue'],
    data: function () {
        return {
            traitsOptions: [
                {
                    label: 'Hair',
                    value: '',
                    disable: true,
                },
                'brown_hair', 'black_hair', 'blonde_hair', 'colored_hair', 'white_hair', 'auburn_hair',
                {
                    label: 'Eyes',
                    value: '',
                    disable: true,
                },
                'brown_eyes', 'blue_eyes', 'hazel_eyes', 'green_eyes', 'gray_eyes',
                {
                    label: 'Boobs',
                    value: '',
                    disable: true,
                },
                'small_boobs', 'average_boobs', 'big_boobs',
                {
                    label: 'Traits',
                    value: '',
                    disable: true,
                },
                'brillant', 'famous', 'naturist',
                'noble', 'nympho', 'magnetic', 'masochist',
                'emotional', 'rich', 'photogenic',
                'athletic', 'horny', 'calm',
                'obedient', 'provocative', 'sharp',
                'broke', 'stressed', 'dumb', 'rebellious', 'cold', 'modest'
            ],
            sensitiveOptions: [
                'ass', 'boobs', 'legs', 'pussy'
            ],
            first_name: "",
            last_name: "",
            traits: [],
            source: "",
            modder: "",
            sensitive_area: ""
        }
    },
    methods: {
        onChange() {
            this.$emit('update:modelValue', {
                first_name: this.first_name,
                last_name: this.last_name,
                traits: this.traits,
                source: this.source,
                modder: this.modder,
                sensitive_area: this.sensitive_area
            });
            this.$emit('change');
        },
        load(girlObject) {
            this.first_name = girlObject.first_name;
            this.last_name = girlObject.last_name;
            this.traits = girlObject.traits;
            this.source = girlObject.source;
            this.modder = girlObject.modder;
            this.sensitive_area = girlObject.sensitive_area;
        }
    }
})
</script>