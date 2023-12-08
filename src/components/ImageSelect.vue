<template>
    <div class="p-relative">
        <div class="current" @click="toggle">
            <CustomMedia :src="currentSrc"></CustomMedia>
        </div>
        <div class="choices" :class="{ 'opened': opened }">
            <div v-for="item, index in photos" :key="index">
                <CustomMedia :src="item" @click="onChange(item)"></CustomMedia>
            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';

export default defineComponent({
    components: {
        CustomMedia
    },
    props: {
        photos: Array,
        prefix: String,
        modelValue: String,
        type: String
    },
    emits: ['change', 'update:modelValue'],
    data: function () {
        return {
            selectedImg: '',
            opened: false
        }
    },
    methods: {
        onChange(img) {
            this.selectedImg = img.split('/').slice(-1)[0];
            this.opened = false;
            this.$emit('update:modelValue', this.selectedImg);
            this.$emit('change', { value: this.selectedImg });
        },
        toggle() {
            this.opened = !this.opened;
        }
    },
    computed: {
        currentSrc() {
            console.log(this.prefix + '/' + this.modelValue)
            return this.prefix + '/' + this.modelValue;
        }
    }
})
</script>
<style>
.current {
    width: 20%;
    margin: auto;
    min-height: 5vh;
    background-color: rgba(0, 0, 255, 0.5);
}

.choices {
    position: absolute;
    width: 100%;
    z-index: 5;
    background-color: rgba(0, 0, 0, 0.5);
    transform: scale(1, 0);
    transform-origin: top;
    transition: all ease 0.5s;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
}

.choices.opened {
    transform: scale(1);
}
</style>