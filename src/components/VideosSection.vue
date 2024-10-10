<template>
    <div class="col gridContainer" :class="{'reduced': videoInEdit != -1}">
        <div class="imgGrid">
            <div v-for="vid, index in computeVideos" :key="index">
                <CustomMedia :src="vid" :forceVideo="true" @click="imageClick(index)"></CustomMedia>
            </div>
        </div>
    </div>
    <div class="col editPanel" :class="{'reduced': videoInEdit == -1}">
        <q-select ref="videotype" @update:model-value="onChange" v-model="selectedVideoType" label="Video Type" :options="videoTypeOptions"></q-select>
        <q-select @update:model-value="onChange" v-model="selectedVideoTags" label="Tags (Optional)" multiple :options="videoTagsOptions" use-input use-chips input-debounce="0"></q-select>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';

export default defineComponent({
    components:{
        CustomMedia
    },
    props:{
        videos: Array
    },
    emits: ['change'],
    data: function(){
        return {
            videoInEdit: -1,
            videoTypeOptions : ['creampie_anal','creampie_pussy','facial','fingerass','fingerpussy','fuckass','fuckpussy','gropeass','gropeboob','innerthigh','kissing','lickpussy','orgasm','pinch','remove_hotpants','remove_bra','remove_panty','remove_skirt','remove_top','remove_leggins','remove_jeans','remove_socks','slapass','slapboobs','spank','strip','teaseass','teaseclit','useface','wedgie','masturbation'],
            selectedVideoType : '',
            videoTagsOptions : ['clothed', 'notop','nobot','panty','nopanty','bra','nobra','socks','shirt','skirt','jeans','leggins','hotpants','dress','shorts', 'blondehair','mother'],
            selectedVideoTags : [],
            actualVideos: []
        }
    },
    methods:{
        imageClick(index){
            this.videoInEdit = index;
            var tokens = this.computeVideos[index].split('/').slice(-1)[0].split('_');
            this.selectedVideoType = this.videoTypeOptions.find(t => this.computeVideos[index].split(t).length > 1);
            this.selectedVideoTags = tokens.filter(t => this.videoTagsOptions.includes(t));
        },
        onHover(e){
            if(e.target.paused){
                e.target.play();
            }
        },
        onChange(){
            setTimeout(() =>{
                var newFileName = this.computeVideos[this.videoInEdit].split('/').slice(0,-1).join('/') + '/' + this.selectedVideoType+"_"+this.selectedVideoTags.join("_")+"_"+(Math.floor(Math.random() * 2000))+"." + this.computeVideos[this.videoInEdit].split(".").slice(-1);
                window.ipcRenderer.send('img:rename', {oldPath: this.computeVideos[this.videoInEdit], newPath: newFileName});
                this.actualVideos[this.videoInEdit] = newFileName;
                this.$emit("change");
            }, 200);
        }
    },
    computed:{
        computeVideos(){
            return this.actualVideos;
        }
    },
    created(){
        this.videos.forEach((v)=>{
            this.actualVideos.push(v);
        });
    }
})
</script>
<style>
.wrong{
    outline: 3px red solid;
}
.imgGrid{
    display: grid;
    grid-template-columns: repeat(6, 1fr);
}
.gridContainer{
    width: 100%;
    transition: all ease 0.5s;
}
.gridContainer.reduced{
    width: 80%;
}
.selected{
    outline: 3px skyblue solid;
}
.col{
    display: inline-block;
    vertical-align: top;
}
.editPanel{
    width: 15%;
    transform: scale(1);
    background-color: pink;
    transition: all ease 0.5s;
}
.editPanel.reduced{
    width: 0%;
    transform: scale(0);
}
</style>