<template>
    <div>
        <q-btn color="blue" v-for="pts,index in computeEventsNames" :key="index" @click="selectEvent($event, pts)">
        {{ pts.split('/').slice(-1)[0] }}
        </q-btn>
    </div>
    <div class="eventElements col" v-if="currentEvent != ''">
        <div v-for="el, index in computeEventElements" :key="index" class="elRow">
            <q-select class="col elType" v-if="el.type!='label'" @update:model-value="onElementChange" v-model="eventElements[index].type" label="Element Type" :options="elementTypes"></q-select>
            <div class="col elInput" v-if="el.type!='label'">
                <q-input type="textarea" rows="2" v-if="el.type == 'Narration' || el.type == 'Player Dialog' || el.type == 'Girl Dialog'" v-model="el.value" label="Value" @change="onElementChange"></q-input>
                <ImageSelect class="imageSelect" @change="onImagePick($event, index)" :type="el.type" :photos="computeCurrentPhotos" :prefix="currentEvent" v-if="el.type == 'Image' || el.type == 'Video' || el.type == 'Background'" v-model="eventElements[index].value"></ImageSelect>
            </div>
            <div class="col elToolBar" v-if="el.type!='label'">
                <q-btn @click="removeElement(el)" icon="delete"></q-btn>
            </div>
        </div>
        <q-btn @click="addElement">Add</q-btn>
    </div>
    <fieldset class="eventForm col" v-if="currentEvent != ''">
        <legend>Event Info</legend>
        <q-input v-model="eventName" @change="onInfoChange" label="Name"></q-input>
        <q-input v-model="eventLabel" @change="onInfoChange" label="Label"></q-input>
        <q-input v-model="eventOccurence" @change="onInfoChange" type="number" label="Occurence"></q-input>
        <q-input v-model="eventCooldown" @change="onInfoChange" type="number" label="Cooldown"></q-input>
        
        <q-select @update:model-value="onInfoChange" v-model="eventDays" label="Days" multiple :options="daysOptions" use-input use-chips input-debounce="0"></q-select>
        <q-input v-model="eventSource" @change="onInfoChange" label="Source"></q-input>
        <q-input v-model="eventModder" @change="onInfoChange" label="Modder"></q-input>
        <fieldset>
            <legend>Requirement</legend>
            <q-input v-model="eventStats.intellect" @change="onInfoChange" type="number" label="Intellect"></q-input>
            <q-input v-model="eventStats.naturism" @change="onInfoChange" type="number" label="Naturism"></q-input>
            <q-input v-model="eventStats.affection" @change="onInfoChange" type="number" label="Affection"></q-input>
            <q-input v-model="eventStats.corruption" @change="onInfoChange" type="number" label="Corruption"></q-input>
            <q-input v-model="eventStats.discipline" @change="onInfoChange" type="number" label="Discipline"></q-input>
            <q-input v-model="eventStats.fear" @change="onInfoChange" type="number" label="Fear"></q-input>
        </fieldset>
    </fieldset>
    <div class="imgGrid">
        <CustomMedia v-for="img,index in computeCurrentPhotos" :key="index" :src="img"></CustomMedia>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import ImageSelect from './ImageSelect.vue';
import CustomMedia from './CustomMedia.vue';

export default defineComponent({
    components: {
    ImageSelect,
    CustomMedia
},
    props:{
        files: Array
    },
    data: function(){
        return {
            currentEvent: '',

            daysOptions: [
                {label:'Monday', value:'1'},
                {label:'Tuesday', value:'2'},
                {label:'Wednesday', value:'3'},
                {label:'Thursday', value:'4'},
                {label:'Friday', value:'5'},
                {label:'Satirday', value:'6'},
                {label:'Sunday', value:'7'}
            ],

            eventName:'',
            eventLabel:'',
            eventOccurence:0,
            eventCooldown:0,
            eventDays: [],
            eventSource:'',
            eventModder:'',
            eventStats:{
                intellect:0,
                naturism:0,
                affection:0,
                corruption:0,
                discipline:0,
                fear:0
            },

            eventElements: [],
            elementTypes: [
                'Narration',
                'Player Dialog',
                'Girl Dialog',
                'Image',
                'Image End',
                'Video',
                'Video End',
                'Background'
            ]
        }
    },
    methods:{
        selectEvent(e, event){
            this.currentEvent = event;
            this.loadEventInfos();
            this.loadEventElements();
        },
        loadEventInfos(){
            window.ipcRenderer.invoke('file:read', {path: this.currentEvent + "/eventConfig.ini"}).then((content)=>{
                var lines = content.split("\n");
                lines.forEach(l => {
                    if(l.split("event_name =").length > 1){
                        this.eventName = l.split("event_name")[1].trim().substring(1).trim();
                    }
                    if(l.split("event_label =").length > 1){
                        this.eventLabel = l.split("event_label")[1].trim().substring(1).trim();
                    }
                    if(l.split("event_occurence =").length > 1){
                        this.eventOccurence = parseInt(l.split("event_occurence")[1].trim().substring(1).trim(),10);
                    }
                    if(l.split("event_cooldown =").length > 1){
                        this.eventCooldown = parseInt(l.split("event_cooldown")[1].trim().substring(1).trim(),10);
                    }
                    if(l.split("allowedDays =").length > 1){
                        this.eventDays = this.daysOptions.filter(d => l.split("allowedDays")[1].trim().substring(1).trim().split(',').includes(d.value));
                    }
                    if(l.split("source =").length > 1){
                        this.eventSource = l.split("source")[1].trim().substring(1).trim();
                    }
                    if(l.split("modder =").length > 1){
                        this.eventModder = l.split("modder")[1].trim().substring(1).trim();
                    }
                    if(l.split("stats_inacdf =").length > 1){
                        var toks = l.split("stats_inacdf")[1].trim().substring(1).trim().split(',');
                        this.eventStats.intellect = parseInt(toks[0]);
                        this.eventStats.naturism = parseInt(toks[1]);
                        this.eventStats.affection = parseInt(toks[2]);
                        this.eventStats.corruption = parseInt(toks[3]);
                        this.eventStats.discipline = parseInt(toks[4]);
                        this.eventStats.fear = parseInt(toks[5]);
                    }
                });
            });
        },
        loadEventElements(){
            window.ipcRenderer.invoke('file:read', {path: this.computeCurrentEventFile}).then((content)=>{
                this.eventElements = this.parseEventElements(content.split("\n"));
            })
        },
        onInfoChange(){
            setTimeout(() =>{
                var iniText = "[info]\n";
                iniText += "event_name = " + this.eventName+"\n";
                iniText += "event_label = " + this.eventLabel+"\n";
                iniText += "occurence = " + this.eventOccurence+"\n";
                iniText += "cooldown = " + this.eventCooldown+"\n";
                
                iniText += "allowedDays = ";
                iniText += this.eventDays.map(e => e.value).join(',');
                iniText += "\n";
                
                iniText += "source = " + this.eventSource+"\n";
                iniText += "modder = " + this.eventModder+"\n";
                
                iniText += "[requirements]\n";
                
                iniText += "stats_inacdf = " + this.eventStats.intellect+",";
                iniText += this.eventStats.naturism+",";
                iniText += this.eventStats.affection+",";
                iniText += this.eventStats.corruption+",";
                iniText += this.eventStats.discipline+",";
                iniText += this.eventStats.fear;
                iniText += "\n";
                window.ipcRenderer.send('file:write', {path: this.currentEvent + "/eventConfig.ini", text: iniText})
            }, 200);
        },
        onImagePick(e,index){
            this.eventElements[index].value = e.value;
            this.onElementChange();
        },
        onElementChange(){
            var fourSpaces = "    ";
            var rpyText = "label "+this.eventLabel+":\n";
            this.eventElements.forEach(function(e,i){
                switch(e.type){
                    case "label":
                        //rpyText += e.value + "\n";
                        break;
                    case "Narration":
                    rpyText += fourSpaces + "\""+e.value+"\"\n";
                    break;
                    case "Player Dialog":
                    rpyText += fourSpaces + "player \""+e.value+"\"\n";
                    break;
                    case "Girl Dialog":
                    rpyText += fourSpaces + "event_girl \""+e.value+"\"\n";
                    break;
                    case "Image":
                    rpyText += fourSpaces + "$selectedEvent.setImg(\""+e.value+"\")\n";
                    break;
                    case "Image End":
                    rpyText += fourSpaces + "$selectedEvent.setImg()\n";
                    break;
                    case "Video":
                    rpyText += fourSpaces + "$selectedEvent.setVid(\""+e.value+"\")\n";
                    break;
                    case "Video End":
                    rpyText += fourSpaces + "$selectedEvent.setVid()\n";
                    break;
                    case "Background":
                    rpyText += fourSpaces + "$selectedEvent.setBackground(\""+e.value+"\")\n";
                    break;
                }
            });
            rpyText += fourSpaces + "jump eventend\n";

            window.ipcRenderer.send('file:write', {path: this.computeCurrentEventFile, text: rpyText})
        },
        parseEventElements(lines){
            var els = [];
            lines.forEach(function(l){
                var tokens = l.trim().split(" ");
                if(tokens[0].charAt(0) == "#"){
                    return;
                }
                var el = {type: "Narration", value:""};
                if(tokens[0] == "player"){
                    el.type = "Player Dialog";
                    var texte = tokens.slice(1, tokens.length).join(" ");
                    el.value = texte.substring(1, texte.length -1);
                }else if(tokens[0] == "event_girl"){
                    el.type = "Girl Dialog";
                    var texte = tokens.slice(1, tokens.length).join(" ");
                    el.value = texte.substring(1, texte.length -1);
                }else if(tokens[0].charAt(0) == '"'){
                    el.type = "Narration";
                    var texte = tokens.slice(0, tokens.length).join(" ");
                    el.value = texte.substring(1, texte.length -1);
                }else if(tokens[0] == "$selectedEvent.setImg()"){
                    el.type = "Image End";
                }else if(tokens[0] == "$selectedEvent.setVid()"){
                    el.type = "Video End";
                }else if(tokens[0].includes("$selectedEvent.setBackground")){
                    el.type = "Background";
                    el.value = tokens[0].split('"')[1];
                }else if(tokens[0].includes("$selectedEvent.setImg")){
                    el.type = "Image";
                    el.value = tokens[0].split('"')[1];
                }else if(tokens[0].includes("$selectedEvent.setVid")){
                    el.type = "Video";
                    el.value = tokens[0].split('"')[1];
                }else if(tokens[0] == "label"){
                    el.type= "label";
                    el.value = l;
                }else{
                    return;
                }
                els.push(el);
            });
            return els;
        },
        addElement(){
            this.eventElements.push({type: 'Narration', value: ''});
        },
        removeElement(e){
            this.onElementChange();
            this.eventElements.splice(this.eventElements.indexOf(e),1);
        }
    },
    computed:{
        computeEventsNames(){
            return this.files.filter(function(p){
                if(p.includes("/events/")){
                    return p.split("/events/")[1].split("/").length == 1;
                }
                return false;
            });
        },
        computeCurrentPhotos(){
            if(this.currentEvent != ''){
                var photos = this.files.filter(p => p.split(this.currentEvent).length > 1 && p != this.currentEvent && p.split(".")[1] != "ini" && p != this.currentEvent && p.split(".")[1] != "rpy")
                return photos;
            }
            return [];
        },
        computeCurrentEventFile(){
            var theF = this.files.find(p => p.split(this.currentEvent).length > 1 && p != this.currentEvent && p.split(".")[1] == "rpy");
            return theF;
        },
        computeEventElements(){
            return this.eventElements;
        }
    }
})
</script>
<style>
.col{
    display: inline-block;
    vertical-align: top;
}
.eventForm{
    width: 20%;
}
.eventElements{
    background-color: pink;
    width: 65%;
}
.elType{
    width: 15%;
}
.elInput{
    width: 70%;
}
.elInput .imageSelect{
    margin: auto;
    min-width: 5vw;
    min-height: 3vh;
    background-color: rgba(0,0,0,0.5);
}
.elToolBar{
    width: 10%;
}
.imgGrid{
    display: grid;
    grid-template-columns: repeat(8,1fr);
}
</style>