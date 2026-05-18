<template>
    <div>
        <q-btn color="blue" v-for="pts, index in computeEventsNames" :key="index" @click="selectEvent($event, pts)">
            {{ pts.split('/').slice(-1)[0] }}
        </q-btn>
        <q-btn color="green" glossy>create +</q-btn>
    </div>
    <div class="eventElements col" v-if="currentEvent != ''">
        <div v-for="el, index in computeEventElements" :key="index" class="elRow">
            <q-select class="col elType" v-if="el.type != 'label'" @update:model-value="onElementChange" v-model="eventElements[index].type" label="Element Type" :options="elementTypes"></q-select>
            <div class="col elInput" v-if="el.type != 'label'">
                <q-input type="textarea" rows="2" v-if="el.type == 'Narration' || el.type == 'Player Dialog' || el.type == 'Girl Dialog'" v-model="el.value" label="Value" @change="onElementChange"></q-input>
                <ImageSelect class="imageSelect" @change="onImagePick($event, index)" :type="el.type" :photos="computeCurrentPhotos" :prefix="currentEvent" v-if="el.type == 'Image' || el.type == 'Video' || el.type == 'Background'" v-model="eventElements[index].value"></ImageSelect>
            </div>
            <div class="col elToolBar" v-if="el.type != 'label'">
                <q-btn @click="removeElement(el)" icon="delete"></q-btn>
            </div>
        </div>
        <q-btn @click="addElement">Add</q-btn>

        <hr>
        <div>New parser</div>
        <div v-if="eventObject">
            <div v-for="(p,i) in eventObject.parts" :key="i">
                <div>{{ p.name }}</div>
                <div v-for="(e,j) in p.els" :key="j">
                    <EventElementForm :photos="computeCurrentPhotos" :eventName="currentEvent" :element="e"></EventElementForm>
                </div>
            </div>
        </div>
        
    </div>
    <fieldset class="eventForm col" v-if="currentEvent != ''">
        <legend>Event Info</legend>
        <q-input v-model="eventInformations.display_name" @change="onNameChange" label="Name"></q-input>
        <q-input v-model="eventInformations.event_cooldown" @change="onInfoChange" label="Cooldown"></q-input>
        <q-select label="Place(s)" @update:model-value="onInfoChange" v-model="eventInformations.event_type" :multiple="true" :options="eventPlaceOptions"></q-select>
        <label>Time</label>
        <q-range label-always v-model="eventTime" :min="1" :max="23" @change="onTimeChange"></q-range>
        <q-select :options="probaPresets" v-model="eventProba" @update:model-value="onProbaChange" label="Proba"></q-select>
        <q-select :options="requirementsPresets" v-model="eventRequirement" @update:model-value="onRequirementsChange" label="Requirements" :multiple="true"></q-select>
        <q-checkbox v-model="eventInformations.one_time_event" label="Happen Only Once"></q-checkbox>
        <q-checkbox v-model="eventInformations.reset_outfit_when_finished" label="Reset clothes on end"></q-checkbox>
    </fieldset>
    <div class="imgGrid">
        <CustomMedia v-for="img, index in computeCurrentPhotos" :key="index" :src="img"></CustomMedia>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import ImageSelect from './ImageSelect.vue';
import CustomMedia from './CustomMedia.vue';
import EventParser from 'src/utils/eventParser';
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
            EventParser,

            eventPlaceOptions: [
                "home",
                "dream",
                "pre_exam", "during_exam", "post_exam",
                "post_shoot",
                "home_visit", "home_visit_early", "home_visit_call",
                "office", "teachers_lounge", "bathroom", "clinic", "cafeteria", "locker_room",
                "beach", "pier", "mall", "coffee_shop", "park"
            ],

            requirementsPresets: [
                {
                    label: 'Corruption',
                    value: '',
                    disable: true
                },
                {
                    label: 'Prude',
                    value: 'girl.corruption < 25'
                },
                {
                    label: 'Slut',
                    value: 'girl.corruption >= 25 and girl.corruption < 75'
                },
                {
                    label: 'Whore',
                    value: 'girl.corruption >= 75'
                },
                {
                    label: 'Naturism',
                    value: '',
                    disable: true
                },
                {
                    label: 'Shy',
                    value: 'girl.naturism < 25'
                },
                {
                    label: 'Revealing',
                    value: 'girl.naturism >= 25 and girl.naturism < 75'
                },
                {
                    label: 'Naturist',
                    value: 'girl.naturism >= 75'
                },
                {
                    label: 'Affection',
                    value: '',
                    disable: true
                },
                {
                    label: 'Defiant',
                    value: 'girl.affection < 25'
                },
                {
                    label: 'Loving',
                    value: 'girl.affection >= 25 and girl.affection < 75'
                },
                {
                    label: 'Mad for you',
                    value: 'girl.affection >= 75'
                },
                {
                    label: 'Fear',
                    value: '',
                    disable: true
                },
                {
                    label: 'Confident',
                    value: 'girl.fear < 25'
                },
                {
                    label: 'Normal',
                    value: 'girl.fear >= 25 and girl.fear < 75'
                },
                {
                    label: 'Scared',
                    value: 'girl.fear >= 75'
                }
            ],
            probaPresets: [
                {
                    label: 'Rarely',
                    value: 20
                },
                {
                    label: 'Sometimes',
                    value: 50

                },
                {
                    label: 'Often',
                    value: 80
                }
            ],

            eventTime: {
                min: 1,
                max: 23
            },
            eventProba: null,
            eventRequirement: [],

            eventInformations: {
                name: '',
                display_name: '',
                event_type: [],
                requirements: 'False',
                requirement_description: 'None',
                min_chance_to_happen: 20,
                event_cooldown: 2,
                stages: [],
                one_time_event: true,
                impacts: {
                    participants: {
                        impacts: {
                            corruption: [0, 50],
                            naturism: [0, 50],
                            affection: [0, 50],
                            fear: [0, 50],
                        }
                    }
                },
                reset_outfit_when_finished: true,
                hide_in_menus: false,
                ignore_frequency: true
            },

            eventElements: [],
            elementTypes: [
                'Narration',
                'Player Dialog',
                'Girl Dialog',
                'Image',
                'Video',
                'Video End',
                'Background',
            ],

            eventObject: null
        }
    },
    methods: {
        selectEvent(e, event) {
            this.currentEvent = event;
            this.loadEventInfos();
            setTimeout(() => {
                this.loadEventElements()
            }, 200)
        },
        loadEventInfos() {
            window.ipcRenderer.invoke('file:read', { path: this.currentEvent + "/event_config.json" }).then((content) => {
                this.eventInformations = JSON.parse(content);
                if (this.eventInformations.requirements.split('time_manager.hour > ').length > 1) {
                    this.eventTime.min = parseInt(this.eventInformations.requirements.split('time_manager.hour > ')[1].split(' and')[0], 10)
                }
                if (this.eventInformations.requirements.split('time_manager.hour < ').length > 1) {
                    this.eventTime.max = parseInt(this.eventInformations.requirements.split('time_manager.hour < ')[1].split(' and')[0], 10)
                }
                this.eventProba = this.probaPresets.find(p => p.value == this.eventInformations.min_chance_to_happen)
                this.eventRequirement = this.requirementsPresets.filter(r => r.value != '' && this.eventInformations.requirements.split(r.value).length > 1)
            });
        },
        loadEventElements() {
            console.log('loading ' + this.computeCurrentEventFile)
            window.ipcRenderer.invoke('file:read', { path: this.computeCurrentEventFile }).then((content) => {
                //Test du parser externe
                this.eventObject = EventParser.parsePythonToObject(content)
                console.log('Event Object',this.eventObject)
                // console.log(EventParser.eventObjectToPython(eventObject))
                
                this.eventElements = this.parseEventElements(content.split("\n"));
            })
        },
        onNameChange() {
            this.eventInformations.name = (this.eventInformations.display_name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
            this.eventInformations.stages = [(this.folderPath + '_' + this.eventInformations.name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')]
            this.onInfoChange()
        },
        onProbaChange() {
            setTimeout(() => {
                this.eventInformations.min_chance_to_happen = this.eventProba.value
                this.onInfoChange()
            }, 200)
        },
        onRequirementsChange() {
            setTimeout(() => {
                this.onTimeChange()
            }, 200)
        },
        onTimeChange() {
            this.eventInformations.requirements = 'time_manager.hour > ' + this.eventTime.min + ' and time_manager.hour < ' + this.eventTime.max + (this.eventRequirement.length > 0 ? (' and ' + this.eventRequirement.map((r) => { return r.value }).join(' and ')) : '')
            this.eventInformations.requirement_description = 'Between ' + this.eventTime.min + 'h and ' + this.eventTime.max + 'h' + (this.eventRequirement.length > 0 ? (' and girl status ' + this.eventRequirement.map((r) => { return r.label }).join(', ')) : '')
            this.onInfoChange()
        },
        onInfoChange() {
            setTimeout(() => {
                console.log('To Write', this.eventInformations)
                window.ipcRenderer.send('file:write', { path: this.currentEvent + "/event_config.json", text: JSON.stringify(this.eventInformations) })
            }, 200);
        },
        onImagePick(e, index) {
            this.eventElements[index].value = e.value;
            this.onElementChange();
        },
        onElementChange() {
            setTimeout(() => {
                var fourSpaces = "    ";
                var rpyText = "label " + this.eventInformations.name + ":\n";
                rpyText += fourSpaces + '$selected_girl = current_event.participants[0]\n';
                this.eventElements.forEach(function (e, i) {
                    switch (e.type) {
                        case "label":
                            //rpyText += e.value + "\n";
                            break;
                        case "Narration":
                            rpyText += fourSpaces + "\"" + e.value + "\"\n";
                            break;
                        case "Player Dialog":
                            rpyText += fourSpaces + "player.character \"" + e.value + "\"\n";
                            break;
                        case "Girl Dialog":
                            rpyText += fourSpaces + "selected_girl.character \"" + e.value + "\"\n";
                            break;
                        case "Image":
                            rpyText += fourSpaces + "$current_event.show_image(\"" + e.value + "\")\n";
                            break;
                        case "Video":
                            rpyText += fourSpaces + "$current_event.show_video(\"" + e.value + "\")\n";
                            break;
                        case "Video End":
                            rpyText += fourSpaces + "$current_event.hide_video()\n";
                            break;
                        case "Background":
                            rpyText += fourSpaces + "$selectedEvent.setBackground(\"" + e.value + "\")\n";
                            break;
                    }
                });
                rpyText += fourSpaces + "return\n";
                console.log('Write to ' + this.computeCurrentEventFile)
                window.ipcRenderer.send('file:write', { path: this.computeCurrentEventFile, text: rpyText })
            }, 50)
        },
        parseEventElements(lines) {
            var els = [];
            lines.forEach(function (l) {
                var tokens = l.trim().split(" ");
                if (tokens[0].charAt(0) == "#") {
                    return;
                }
                var el = {};
                if (tokens[0] == "player.character") {
                    el.type = "Player Dialog";
                    var texte = tokens.slice(1, tokens.length).join(" ");
                    el.value = texte.substring(1, texte.length - 1);
                } else if (tokens[0] == "selected_girl.character") {
                    el.type = "Girl Dialog";
                    var texte = tokens.slice(1, tokens.length).join(" ");
                    el.value = texte.substring(1, texte.length - 1);
                } else if (tokens[0].charAt(0) == '"') {
                    el.type = "Narration";
                    var texte = tokens.slice(0, tokens.length).join(" ");
                    el.value = texte.substring(1, texte.length - 1);
                } else if (tokens[0] == "$current_event.hide_video()") {
                    el.type = "Video End";
                } else if (tokens[0].includes("$current_event.set_background")) {
                    el.type = "Background";
                    el.value = tokens[0].split('"')[1];
                } else if (tokens[0].includes("$current_event.show_image")) {
                    el.type = "Image";
                    el.value = l.trim().split('"')[1];
                } else if (tokens[0].includes("$current_event.show_video")) {
                    el.type = "Video";
                    el.value = l.trim().split('"')[1];
                } else if (tokens[0] == "label") {
                    el.type = "label";
                    el.value = l;
                } else {
                    return;
                }
                if (el.type != undefined) {
                    els.push(el);
                }
            });
            return els;
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
                if (p.includes("/events/")) {
                    return p.split("/events/")[1].split("/").length == 1;
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
                theF = './packsCA/' + this.folderPath + '/events/' + this.currentEvent.split('/').slice(-1)[0] + '/' + this.eventInformations.name + '.rpy';
            }
            return theF;
        },
        computeEventElements() {
            return this.eventElements;
        }
    }
})
</script>
<style>
.col {
    display: inline-block;
    vertical-align: top;
}

.eventForm {
    width: 20%;
    color: black;
}

.eventElements {
    background-color: pink;
    width: 65%;
}

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

.imgGrid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
}
</style>