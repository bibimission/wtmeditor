<template>
    <div>
        <q-btn color="blue" v-for="pts, index in computeEventsNames" :key="index" @click="selectEvent($event, pts)">
            {{ pts.split('/').slice(-1)[0] }}
        </q-btn>
    </div>
    <div class="eventElements col" v-if="currentEvent != ''">
        <EventElementForm v-for="el, index in event.parts" :key="index" :element="el" :photos="computeCurrentPhotos" :eventName="currentEvent"></EventElementForm>
        <q-btn @click="addElement">Add</q-btn>
    </div>
    <fieldset class="eventForm col text-black" v-if="currentEvent != ''">
        <legend>Event Info</legend>
        <q-input v-model="event.label" @change="onElementChange" label="Label" disable></q-input>
        <q-input v-model="event.cooldown" @change="onElementChange" type="number" label="Cooldown"></q-input>

        <fieldset>
            <ApiGirlSelector :apiGirls="apiGirls" v-model="event.girlsNeeded" @update:modelValue="onElementChange" :permanentGirl="folderPath"></ApiGirlSelector>
            <q-select class=" " @update:model-value="onElementChange" :options="placeChoices" label="Place" v-model="event.place"></q-select>
            <q-input type="number" v-model="event.hourStart" label="Hour Start" min="1" max="23" @change="onElementChange"></q-input>
            <q-input type="number" v-model="event.hourEnd" label="Hour End" min="1" max="23" @change="onElementChange"></q-input>
            <q-input type="number" v-model="event.chance" step="0.1" label="Chance percentage" min="0" max="1" @change="onElementChange"></q-input>
        </fieldset>

        <q-select @update:model-value="onElementChange" v-model="event.days" label="Days" multiple :options="daysOptions"></q-select>

    </fieldset>
    <div class="imgGrid">
        <CustomMedia v-for="img, index in computeCurrentPhotos" :key="index" :src="img"></CustomMedia>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import ImageSelect from './ImageSelect.vue';
import CustomMedia from './CustomMedia.vue';
import EventElementForm from './EventElementForm.vue';
import EventParser from 'src/utils/eventParser';
import ApiGirlSelector from './ApiGirlSelector.vue';

export default defineComponent({
    components: {
        ImageSelect,
        CustomMedia,
        EventElementForm,
        ApiGirlSelector
    },
    props: {
        files: Array,
        folderPath: String,
        apiGirls: {
            type: Array,
            default: () => { return [] }
        }
    },
    data: function () {
        return {
            currentEvent: '',

            daysOptions: [
                { label: 'Monday', value: '1' },
                { label: 'Tuesday', value: '2' },
                { label: 'Wednesday', value: '3' },
                { label: 'Thursday', value: '4' },
                { label: 'Friday', value: '5' },
                { label: 'Saturday', value: '6' },
                { label: 'Sunday', value: '7' }
            ],

            event: {
                chance: 0,
                cooldown: 0,
                days: [],
                label: "",
                girlsNeeded: [],
                parts: [],
                place: ""
            },

            placeChoices: [
                { label: 'Home', value: 'home' },
                { label: 'Academy Hall', value: 'academyhall' },
                { label: 'On the way to school', value: 'gotoschool' },
                { label: 'On the way back Home', value: 'lb_academyhall_home' },
            ],
            hourStart: 0,
            hourEnd: 0,
            eventPlace: null,
            eventChance: 0,
            eventConditions: [],
            conditionChoices: [],

            eventParts: []

        }
    },
    methods: {
        selectEvent(e, event) {
            this.currentEvent = event;
            this.event.label = event.split('/').slice(-1)
            this.loadEventElements();
        },
        loadEventElements() {
            window.ipcRenderer.invoke('file:read', { path: this.computeCurrentEventFile }).then((content) => {
                this.parseEventElements(content);
            })
        },
        onElementChange() {
            var rpyText = EventParser.eventObjectToPython(this.event)
            window.ipcRenderer.send('file:write', { path: this.computeCurrentEventFile, text: rpyText })
        },
        parseEventElements(content) {
            this.event = EventParser.parsePythonToObject(content)
            this.event.girlsNeeded.push(this.folderPath)
            console.log(this.event)
        },
        addElement() {
            this.event.parts.push({ type: 'Label', name: this.event.label + '_'+(this.event.parts.length +1), els:[] });
        }
    },
    computed: {
        computeEventsNames() {
            return this.files.filter(function (p) {
                if (p.includes("/plannedEvents/")) {
                    return p.split("/plannedEvents/")[1].split("/").length == 1;
                }
                return false;
            });
        },
        computeCurrentPhotos() {
            if (this.currentEvent != '') {
                var photos = this.files.filter(p => p.split(this.currentEvent).length > 1 && p != this.currentEvent && p.split(".")[1] != "ini" && p != this.currentEvent && p.split(".")[1] != "rpy")
                return photos;
            }
            return [];
        },
        computeCurrentEventFile() {
            var theF = this.files.find(p => p.split(this.currentEvent).length > 1 && p != this.currentEvent && p.split(".")[1] == "rpy");
            if (theF == null) {
                theF = './packs/' + this.folderPath + '/plannedEvents/' + this.event.label + '/' + this.event.label + '.rpy';
            }
            return theF;
        }
    },
    mounted() {
        console.log('wesh')
    }
})
</script>
<style>
.col {
    display: inline-block;
    vertical-align: top;
}

.eventForm {
    width: 18vw;
}

.eventElements {
    background-color: pink;
    width: 75vw;
}

.imgGrid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
}

.text-black {
    color: black;
}
</style>