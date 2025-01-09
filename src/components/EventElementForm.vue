<template>
    <div class="elRow">
        <div v-if="element.type == 'Label'" class="labelBody">
            <div class="labelTitle">{{ element.name }}</div>
            <EventElementForm v-for="(el, i) in element.els" :key="i" :element="el" :photos="photos" :eventName="eventName" class="innerRow"></EventElementForm>
            <q-btn @click="addElement">Add</q-btn>
        </div>
        <div v-else-if="element.type == 'Menu'" class="menuBody">
            <div class="col elType">
                <q-select v-model="element.type" label="Element Type" :options="elementTypes" :disable="element.type=='Option'" filled></q-select>
            </div>
            <EventElementForm v-for="(el, i) in element.els" :key="i" :element="el" :photos="photos" :eventName="eventName" class="innerRow"></EventElementForm>
            <q-btn @click="addElement">Add</q-btn>
        </div>
        <template v-else>
            <div class="col elType">
                <q-select v-model="element.type" label="Element Type" :options="elementTypes" :disable="element.type=='Option'" filled></q-select>
            </div>
            <div class="col elInput" v-if="element.type != 'Label'">
                <template v-if="element.type === 'Narration'">
                    <q-input type="textarea" rows="2" v-model="element.text" label="Value" @change="onElementChange" style="width:60%"></q-input>
                </template>
                <template v-if="element.type === 'Option'">
                    <div class="stretch optionBody">
                        <q-input type="text" v-model="element.text" label="Value" @change="onElementChange" style="width:60%"></q-input>
                        <EventElementForm v-for="(el, i) in element.els" :key="i" :element="el" :photos="photos" :eventName="eventName" class="innerRow"></EventElementForm>
                        <q-btn @click="addElement">Add</q-btn>
                    </div>
                </template>
                <template v-else-if="element.type === 'Dialog'">
                    <q-input type="text" v-model="element.value" label="Character" @change="onElementChange" style="width:10%"></q-input>
                    <q-input type="textarea" rows="1" v-model="element.text" label="Text" @change="onElementChange" style="width:60%"></q-input>
                </template>
                <template v-else-if="element.type === 'Show Phone'">
                    <q-checkbox label="With vibration" v-model="element.value" @change="onElementChange"></q-checkbox>
                </template>
                <ImageSelect class="imageSelect" :type="element.type" :photos="computeCurrentPhotos" :prefix="eventName" v-if="element.type == 'Image' || element.type == 'Video' || element.type == 'Background'" v-model="element.value"></ImageSelect>
            </div>
            <div class="col elToolBar">
                <q-btn @click="removeElement(el)" icon="delete"></q-btn>
            </div>
        </template>
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
                'Menu',
                'Option',

                'Event End'
            ]
        }
    },
    methods: {
        removeElement() {
            this.$emit('remove')
        },
        onElementChange() { },
        addElement() {
            if (this.element.type == 'Menu') {
                this.element.els.push({ type: 'Option', text: '' })
            } else {
                this.element.els.push({ type: 'Narration', text: '' })
            }
        }
    },
    mounted() {
        // console.log(this.element)
    }
}
</script>
<style scoped>
.elRow {
    position: relative;
    display: flex;
    justify-content: flex-start;
    border-bottom: 0.1vh solid rgb(190, 190, 190);
}

.elType {
    min-width: 8vw;
    width: fit-content;
    flex-grow: 0;
    flex-shrink: 0;
    margin-right: 2vw;
}

.elInput {
    width: 50vw;
    display: flex;
}

.elInput .imageSelect {
    margin: auto;
    min-width: 5vw;
    min-height: 3vh;
    background-color: rgba(0, 0, 0, 0.5);
}

.elToolBar {
    width: fit-content;
    flex-grow: 0;
    flex-shrink: 0;
}

.innerRow {
    margin: 0 0 0 4vw;
}

.labelBody {
    background-color: rgb(209, 247, 168);
    margin-bottom: 2vh;
    padding: 1vh;
    border: black solid 1px;
    color: black;
    width: 100%;
}

.labelTitle {
    color: black;
    font-size: 2em;
    font-weight: bold;
}

.menuBody {
    background-color: rgb(250, 202, 112);
    color: black;
}
.optionBody{
    background-color: rgb(171, 250, 155);
}
</style>