<template>
    <div>
        <q-btn color="blue" v-for="pts, index in computeEventsNames" :key="index" @click="selectEvent($event, pts)">
            {{ pts.split('/').slice(-1)[0] }}
        </q-btn>
    </div>
    <div class="eventElements col" v-if="currentEvent != ''">
        <EventElementForm v-for="el, index in eventParts" :key="index" :element="el" :photos="computeCurrentPhotos" :eventName="currentEvent"></EventElementForm>
        <q-btn @click="addElement">Add</q-btn>
    </div>
    <fieldset class="eventForm col text-black" v-if="currentEvent != ''">
        <legend>Event Info</legend>
        <q-input v-model="eventLabel" @change="onElementChange" label="Label" disable></q-input>
        <q-input v-model="eventCooldown" @change="onElementChange" type="number" label="Cooldown"></q-input>

        <fieldset>
            <q-input v-model="otherGirls" label="Other girls (separated with ,)" @change="onElementChange"></q-input>
            <q-select class=" " @update:model-value="onElementChange" :options="placeChoices" label="Place" v-model="eventPlace"></q-select>
            <q-input type="number" v-model="hourStart" label="Hour Start" min="1" max="23" @change="onElementChange"></q-input>
            <q-input type="number" v-model="hourEnd" label="Hour End" min="1" max="23" @change="onElementChange"></q-input>
            <q-input type="number" v-model="eventChance" step="0.1" label="Chance percentage" min="0" max="1" @change="onElementChange"></q-input>
        </fieldset>

        <q-select @update:model-value="onElementChange" v-model="eventDays" label="Days" multiple :options="daysOptions"></q-select>

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

export default defineComponent({
    components: {
        ImageSelect,
        CustomMedia,
        EventElementForm
    },
    props: {
        files: Array,
        folderPath: String
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

            eventLabel: '',
            eventCooldown: 1,
            eventDays: [],

            eventElements: [],
            otherGirls: '',
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
            this.eventLabel = event.split('/').slice(-1)
            this.loadEventElements();
        },
        loadEventElements() {
            window.ipcRenderer.invoke('file:read', { path: this.computeCurrentEventFile }).then((content) => {
                this.eventElements = this.parseEventElements(content);
            })
        },
        onImagePick(e, index) {
            this.eventElements[index].value = e.value;
            this.onElementChange();
        },
        onElementChange() {
            var fourSpaces = "    ";

            var rpyText = "init -1 python:\n";
            console.log(this.eventDays)
            rpyText += fourSpaces + 'DB_plannedEvents.append(Event("' + this.eventLabel + '", ' + this.eventCooldown + ', _timeFrame = [' + this.hourStart + ',' + this.hourEnd + '], ' +
                '_girlsNeeded = ["' + this.folderPath + (this.otherGirls == '' ? '' : ',' + this.otherGirls) + '"], ' +
                '_locations = ["' + this.eventPlace?.value + '"], ' +
                '_chance = ' + this.eventChance + ', ' +
                ' _condition = "timeManager.day in [' + this.eventDays.map((d) => { return d.value })?.join(',') + ']"' +
                '))":\n';
            rpyText += "\n";
            rpyText += "label " + this.eventLabel + ":\n";
            this.eventElements.forEach(function (e, i) {
                switch (e.type) {
                    case "label":
                        //rpyText += e.value + "\n";
                        break;
                    case "Narration":
                        rpyText += fourSpaces + "\"" + e.value + "\"\n";
                        break;
                    case "Player Dialog":
                        rpyText += fourSpaces + "player \"" + e.value + "\"\n";
                        break;
                    case "Girl Dialog":
                        rpyText += fourSpaces + "event_girl \"" + e.value + "\"\n";
                        break;
                    case "Image":
                        rpyText += fourSpaces + "$selectedEvent.setImg(\"" + e.value + "\")\n";
                        break;
                    case "Image End":
                        rpyText += fourSpaces + "$selectedEvent.setImg()\n";
                        break;
                    case "Video":
                        rpyText += fourSpaces + "$selectedEvent.setVid(\"" + e.value + "\")\n";
                        break;
                    case "Video End":
                        rpyText += fourSpaces + "$selectedEvent.setVid()\n";
                        break;
                    case "Show Phone":
                        rpyText += fourSpaces + "show phone\n";
                        break;
                    case "Hide Phone":
                        rpyText += fourSpaces + "hide phone\n";
                        break;
                    case "Background":
                        rpyText += fourSpaces + "$selectedEvent.setBackground(\"" + e.value + "\")\n";
                        break;
                }
            });
            rpyText += fourSpaces + "jump eventend\n";

            window.ipcRenderer.send('file:write', { path: this.computeCurrentEventFile, text: rpyText })
        },
        parseEventElements(content) {
            this.eventParts = []
            var labelParts = content.split('label')
            labelParts.forEach((lp, index) => {
                if (index == 0) { // Le début. C'est soit '' soit c'est le code qui insere dans la BDD des events
                    if (lp.split('DB_plannedEvents').length > 1) {
                        var l = lp.split('\n')[0]
                        const params = l.split('Event(')[1].split(', ');
                        console.log(params)
                        this.eventLabel = params[0].split('"')[1]
                        this.eventCooldown = parseInt(params[1], 10);
                        const timeFrame = params[2].split('[')[1].split(']')[0].split(',');
                        this.hourStart = parseInt(timeFrame[0], 10);
                        this.hourEnd = parseInt(timeFrame[1], 10);
                        this.otherGirls = params[3].split(',').splice(1).join(',');
                        const eventPlaceVal = params[4].split('"')[1]
                        if (eventPlaceVal != '') {
                            this.eventPlace = this.placeChoices.find(p => p.value == eventPlaceVal)
                        }
                        this.eventChance = parseFloat(params[5].split('=')[1].trim())
                        const dayNumbers = params[6]?.split('[')[1]?.split(']')[0]?.split(',').map((el) => { return el == '' ? -1 : parseInt(el, 10) })
                        dayNumbers.forEach((n) => {
                            if (n >= 0) {
                                this.eventDays.push(this.daysOptions.find(d => d.value == n))
                            }
                        })
                    }
                }
                else {
                    var lines = lp.split('\n')
                    var els = [];

                    var currentEl = null;

                    for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                        var l = lines[lineIndex];
                        var tokens = l.trim().split(" ");

                        // Comments are ignored and will disappear
                        if (tokens[0].charAt(0) == "#") {
                            continue;
                        }

                        // Title of the part. Ignored too
                        if (lineIndex == 0) {
                            continue
                        }

                        // Parse Menu. We admit there is not more than 1 menu per label
                        if (l.trim() == 'menu:') {
                            currentEl = { type: 'Menu', els: [], parent: null, indent: (l.length - l.trim().length) }
                            continue;
                        }

                        // Parse Menu Options
                        if (currentEl != null && (currentEl.type == 'Option' || currentEl.type == 'Menu')) {
                            if (l.trim().charAt(l.trim().length - 1) == ':') {
                                if (currentEl.type == 'Option') {
                                    var parent = currentEl.parent
                                    currentEl.parent = null
                                    parent.els.push(currentEl)
                                    currentEl = parent
                                }
                                if (currentEl.type == 'Menu') {
                                    currentEl = { type: 'Option', text: l.trim().substring(1, l.trim().length - 1), els: [], parent: currentEl, indent: (l.length - l.trim().length) }
                                    continue
                                }
                            }

                            // Check for Menu or Option End
                            while (currentEl != null && (l.length - l.trim().length) <= currentEl.indent) {
                                //console.log(currentEl)
                                var parent = currentEl.parent
                                if(parent != null){
                                    parent.els.push(currentEl)
                                    currentEl.parent = null
                                    currentEl = parent
                                }else{
                                    els.push(currentEl);
                                    currentEl = null
                                }
                            }
                        }

                        /// Elements classiques
                        var el = {};

                        // Show/Hide phone. value == true means vibrate
                        if (l.trim() == 'show phone') {
                            el.type = 'Show Phone'
                            el.value = lines[lineIndex + 1].trim() == 'with hpunch'
                        } else if (l.trim() == 'hide phone') {
                            el.type = 'Hide Phone'
                        }

                        // Dialogs
                        else if (tokens[0] == "player" || tokens[0].split("event_girls[").length > 1 || tokens[0] == "ptaPresident.char" || tokens[0] == '"Phone"') {
                            el.type = 'Dialog'
                            var texte = tokens.slice(1, tokens.length).join(" ");
                            el.text = texte.substring(1, texte.length - 1);
                            el.value = tokens[0]
                        }

                        // Narration
                        else if (tokens[0].charAt(0) == '"') {
                            el.type = "Narration";
                            var texte = tokens.slice(0, tokens.length).join(" ");
                            el.text = texte.substring(1, texte.length - 1);
                        }

                        // Jump
                        else if (tokens[0] == "jump") {
                            el.type = 'Jump'
                            el.value = tokens[1]
                        }
                        
                        // Event end
                        else if (l.split("$ renpy.jump(store.locationFrom)").length  > 1) {
                            el.type = 'Event End'
                        }


                        /*
                        else if (tokens[0] == "$selectedEvent.setImg()") {
                            el.type = "Image End";
                        } else if (tokens[0] == "$selectedEvent.setVid()") {
                            el.type = "Video End";
                        } else if (tokens[0].includes("$selectedEvent.setBackground")) {
                            el.type = "Background";
                            el.value = tokens[0].split('"')[1];
                        } else if (tokens[0].includes("$selectedEvent.setImg")) {
                            el.type = "Image";
                            el.value = l.trim().split('"')[1];
                        } else if (tokens[0].includes("$selectedEvent.setVid")) {
                            el.type = "Video";
                            el.value = l.trim().split('"')[1];
                        }
                        else {
                            return;
                        }
                            */

                        if (el.type != undefined) {
                            if (currentEl != null) {
                                currentEl.els.push(el);
                            } else {
                                els.push(el);
                            }
                        }
                    }
                    if (currentEl != null) {
                        els.push(currentEl);
                    }
                    this.eventParts.push({ name: this.eventLabel + (index == 0 ? '' : '_part_' + index), els: els, type: 'Label' })
                }
            })
            console.log(this.eventParts)
        },
        addElement() {
            this.eventElements.push({ type: 'Narration', value: '' });
        },
        removeElement(e) {
            this.onElementChange();
            this.eventElements.splice(this.eventElements.indexOf(e), 1);
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
                theF = './packs/' + this.folderPath + '/plannedEvents/' + this.eventLabel + '/' + this.eventLabel + '.rpy';
            }
            return theF;
        },
        computeEventElements() {
            return this.eventElements;
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