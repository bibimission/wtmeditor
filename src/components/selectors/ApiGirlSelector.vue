<template>
    <div class="elementBody p-relative">
        <div>Required Girls</div>
        <div class="selectedGirlsList">
            <div v-for="(g, i) in computeSelectedGirls" :key="i" class="girlAvatar" @click="toggleGirl(g)">
                <div>
                    <img :src="g.thumb">
                </div>
                <div>{{ g.name + (g.type === 'mother' ? ' (Mom)' : '') }}</div>
            </div>
        </div>
        <q-input v-model="currentSearch" type="text" placeholder="Search" @focus="listOpened = true" @blur="onBlur"></q-input>
        <div class="selectList" v-show="listOpened">
            <div v-for="(g, i) in computeSearchedGirls" :key="i" class="girlOption" :class="{ 'selected': modelValue.includes(g.id) || permanentGirl == g.id }" @click="toggleGirl(g)" tabindex="0">
                <img :src="g.thumb">
                <span>{{ g.name + (g.type === 'mother' ? ' (Mom)' : '') }}</span>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: Array,
            default: () => { return [] }
        },
        permanentGirl: String
    },
    data() {
        return {
            currentSearch: '',
            currentSelection: [],
            listOpened: false,
            apiGirls: []
        }
    },
    emits: ['update:modelValue'],
    computed: {
        computeGirlList() {
            return this.apiGirls.sort((a, b) => { return a.name.localeCompare(b.name) })
        },
        computeSelectedGirls() {
            return this.computeGirlList.filter((g) => { return this.currentSelection.includes(g.id) || this.permanentGirl == g.id })
        },
        computeSearchedGirls() {
            return (this.currentSearch == '' ? this.computeGirlList : this.computeGirlList.filter((g) => { return g.name.toUpperCase().split(this.currentSearch.toUpperCase()).length > 1 })).slice(0, 10)
        }
    },
    mounted() {
        // console.log(this.apiGirls)
        console.log("Yolo")
        this.fetchGirls()
    },
    methods: {
        toggleGirl(g) {
            if (this.permanentGirl == g.id) {
                return
            }
            if (this.currentSelection.includes(g.id)) {
                this.currentSelection = this.currentSelection.filter(gg => g.id != gg)
            } else {
                this.currentSelection.push(g.id)
            }

            this.$emit('update:modelValue', this.currentSelection)
        },
        onBlur() {
            setTimeout(() => {
                this.listOpened = false
            }, 100)
        },
        async fetchGirls() {
            window.ipcRenderer.invoke('api:getAll').then((res) => {
                try {
                    this.apiGirls = JSON.parse(res)
                } catch (e) {
                    console.log(e)
                }
            });
        }
    },
    watch: {
        modelValue(nv) {
            this.currentSelection = nv
        }
    }
}
</script>
<style scoped>
.elementBody {
    border: rgba(0, 0, 0, 0.3) solid 1px;
    color: black;
    overflow: hidden;
}

.selectedGirlsList {
    display: flex;
}

.girlAvatar {
    text-align: center;
    font-size: 0.7em;
    position: relative;
}

.girlAvatar img {
    border-radius: 5px;
    width: 60px;
}

.girlAvatar:hover::after {
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

.selectList {
    position: fixed;
    background-color: white;
    z-index: 10;
    width: 100%;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
    overflow: scroll;
    height: 20vh;
}

.girlOption {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.girlOption img {
    width: 50px;
    border-radius: 5px;
    display: block;
    margin: 0;
}

.girlOption span {
    margin-left: 10px;
}

.girlOption.selected {
    background: var(--color-fourth);
}
</style>