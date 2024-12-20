<template>
    <div class="elRow">
        <q-select class="col elType" v-if="element.type != 'label'" v-model="element.type" label="Element Type" :options="elementTypes"></q-select>
        <div class="col elInput" v-if="element.type != 'label'">
            <q-input type="textarea" rows="2" v-if="element.type == 'Narration' || element.type == 'Player Dialog' || element.type == 'Girl Dialog'" v-model="element.value" label="Value" @change="onElementChange"></q-input>
            <ImageSelect class="imageSelect" :type="element.type" :photos="computeCurrentPhotos" :prefix="eventName" v-if="element.type == 'Image' || element.type == 'Video' || element.type == 'Background'" v-model="element.value"></ImageSelect>
        </div>
        <div class="col elToolBar" v-if="element.type != 'label'">
            <q-btn @click="removeElement(el)" icon="delete"></q-btn>
        </div>
    </div>
</template>
<script>
import ImageSelect from './ImageSelect.vue';
export default {
    components: { ImageSelect },
    props: {
        element: {
            type: Object,
            default: () => { return {} }
        },
        photos: {
            type: Array,
            default: () => { return [] }
        },
        eventName: String
    },
    emits: ['remove'],
    data() {
        return {
            elementTypes: [
                'Narration',
                'Player Dialog',
                'Girl Dialog',
                'Image',
                'Image End',
                'Video',
                'Video End',
                'Background',
                'Show Phone',
                'Hide Phone',
                'Dialog',

                // Special
                'Label',
                'Menu'
            ]
        }
    },
    methods: {
        removeElement() {
            this.$emit('remove')
        },
        onElementChange() { }
    },
    mounted(){
        console.log('Mounted')
    }
}
</script>
<style scoped>

.elType {
    width: 15%;
}

.elInput {
    width: 70%;
}

.elInput .imageSelect {
    margin: auto;
    min-width: 5vw;
    min-height: 3vh;
    background-color: rgba(0, 0, 0, 0.5);
}

.elToolBar {
    width: 10%;
}
</style>