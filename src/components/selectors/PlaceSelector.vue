<template>
    <div class="sidePanel">
        <q-select :options="placesOptions" label="Location" v-model="selectedOutfit" @update:model-value="onChange"></q-select>
    </div>
</template>
<script>
export default {
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            placesOptions: [
                'bathroom',
                'cafeteria',
                'clinic',
                'locker_room',
                'beach',
                'pier',
                'park',
                'coffee_shop',
                'clothing_store',
                'bar',
                'shoot_studio',
                'shoot_changing_room',
                'exam',
                'home'
            ],
            selectedOutfit: null
        }
    },
    methods: {
        onChange() {
            this.$emit('update:modelValue', this.selectedOutfit)
        }
    },
    watch: {
        modelValue(nv) {
            this.selectedOutfit = nv
        }
    }
}
</script>