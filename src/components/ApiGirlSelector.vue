<template>
    <div class="elementBody">
        <div>Required Girls</div>
        <div class="selectedGirlsList">
            <div v-for="(g, i) in computeSelectedGirls" :key="i" class="girlAvatar" @click="toggleGirl(g)">
                <img :src="'https://cdn.ninoss.fr/WTM/GIRLS/' + g.fullName + '.webp'">
                <span>{{ g.name }}</span>
            </div>
        </div>
        <div class="p-relative">
            <q-input v-model="currentSearch" type="text" placeholder="Search" @focus="listOpened = true" @blur="onBlur"></q-input>
            <div class="selectList" v-show="listOpened">
                <div v-for="(g, i) in computeSearchedGirls" :key="i" class="girlOption" :class="{'selected': modelValue.includes(g.fullName)}" @click="toggleGirl(g)" tabindex="0">
                    <img :src="'https://cdn.ninoss.fr/WTM/GIRLS/' + g.fullName + '.webp'">
                    <span>{{ g.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        apiGirls: {
            type: Array,
            default: () => { return [] }
        },
        modelValue: Array
    },
    data() {
        return {
            currentSearch: '',
            currentSelection: [],
            listOpened: false
        }
    },
    emits: ['update:modelValue'],
    computed: {
        computeGirlList() {
            return this.apiGirls.map((g) => { return { name: this.getParsedName(g), fullName: g } }).sort((a,b)=>{ return a.name.localeCompare(b.name) })
        },
        computeSelectedGirls() {
            return this.computeGirlList.filter((g) => { return this.currentSelection.includes(g.fullName) })
        },
        computeSearchedGirls() {
            return (this.currentSearch == '' ? this.computeGirlList : this.computeGirlList.filter((g) => { return g.fullName.toUpperCase().split(this.currentSearch.toUpperCase()).length > 1 })).slice(0, 10)
        }
    },
    mounted() {
        // console.log(this.apiGirls)
    },
    methods: {
        getParsedName(gName) {
            var toks = gName.split('_')
            return toks.slice(-2).join(' ')
        },
        toggleGirl(g){
            if(this.currentSelection.includes(g.fullName)){
                this.currentSelection = this.currentSelection.filter(gg => g.fullName != gg)
            }else{
                this.currentSelection.push(g.fullName)
            }
            
            this.$emit('update:modelValue', this.currentSelection)
        },
        onBlur(){
            setTimeout(()=>{
                this.listOpened = false
            }, 100)
        }
    },
    watch:{
        modelValue(nv){
            this.currentSelection = nv
        }
    }
}
</script>
<style scoped>
.elementBody{
    border: rgba(0,0,0,0.3) solid 1px;
}
.selectedGirlsList {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
}

.girlAvatar {
    text-align: center;
    font-size: 0.7em;
    position: relative;
}
.girlAvatar img{
    border-radius: 5px;
    width: 60px;
}
.girlAvatar:hover::after{
    content: 'x';
    position: absolute;
    top: 0;
    right: 0;
    background: red;
    color: white;
    width: 15px;
    height: 15px;
    border-radius: 5vh;
}

.selectList{
    position: absolute;
    background-color: white;
    z-index: 10;
    width: 100%;
    box-shadow: 5px 5px 10px rgba(0,0,0,0.5);
}
.girlOption{
    display: flex;
    align-items: center;
}
.girlOption img{
    width: 50px;
    border-radius: 5px;
}
.girlOption span{
    margin-left: 10px;
}
.girlOption.selected{
    background: var(--color-fourth);
}
</style>