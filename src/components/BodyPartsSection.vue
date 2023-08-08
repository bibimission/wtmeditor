<template>
    <q-bar color="blue">Face</q-bar>
    <div class="imgGrid">
        <div v-for="pic, index in files.filter(p => p.split('face').length > 1)" :key="index">
            <CustomMedia :src="pic"></CustomMedia>
        </div>
    </div>
    <q-bar color="blue">Boobs</q-bar>
    <div class="imgGrid">
        <div v-for="pic, index in files.filter(p => p.split('boobs').length > 1)" :key="index">
            <CustomMedia :src="pic"></CustomMedia>
        </div>
        <q-file filled v-model="currentFileAdd" label="Add +" stack-label @update:model-value="addFile($event, 'boobs')"/>
    </div>
    <q-bar color="blue">Pussy</q-bar>
    <div class="imgGrid">
        <div v-for="pic, index in files.filter(p => p.split('pussy').length > 1)" :key="index">
            <CustomMedia :src="pic"></CustomMedia>
        </div>
        <q-file filled v-model="currentFileAdd" label="Add +" stack-label @update:model-value="addFile($event, 'pussy')"/>
    </div>
    <q-bar color="blue">Ass</q-bar>
    <div class="imgGrid">
        <div v-for="pic, index in files.filter(p => p.split('ass').length > 1)" :key="index">
            <CustomMedia :src="pic"></CustomMedia>
        </div>
        <q-file filled v-model="currentFileAdd" label="Add +" stack-label @update:model-value="addFile($event, 'ass')"/>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';

export default defineComponent({
    components:{
        CustomMedia
    },
    emits:['change'],
    props:{
        photos: Array,
        folderPath: String
    },
    data: function(){
        return {
            currentFileAdd: null
        }
    },
    computed:{
        files(){
            return this.photos;
        }
    },
    methods:{
        async addFile(e, bodyPart){
            const file = this.currentFileAdd;
            const data = await file.arrayBuffer();
            var imgName = bodyPart+""+this.photos.filter(p => p.split('face').length > 1).length +"."+file.name.split('.').slice(-1);
            window.ipcRenderer.send('img:upload', {path: "packs/"+this.folderPath+'/bodyparts/'+imgName, buffer: data});
            this.$emit('change');
        }
    }
})
</script>
<style>
.wrong{
    outline: 3px red solid;
}
.imgGrid{
    display: grid;
    grid-template-columns: repeat(8, 1fr);
}
img{
    display: inline-block;
}
</style>