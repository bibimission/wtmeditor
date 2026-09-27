<template>
    <div class="formBody">
        <div class="row">
            <div class="infoBlock baseInfo">
                <q-bar class="bg-primary">Base informations</q-bar>
                <q-input v-model="author" label="Author Name" @change="onChange" />
                <q-input v-model="name" label="Last Name" @change="onChange" />
            </div>
        </div>
    </div>
</template>
<script>
export default {
    emits: ['update:modelValue'],
    props: {
        files: {
            type: Array,
            default: () => { return [] }
        }
    },
    data: () => {
        return {
            author: "",
            name: ""
        }
    },
    methods: {
        onChange() {
            this.$emit('update:modelValue', { author: this.author, name: this.name })
        }
    },
    watch: {
        modelValue(newV) {
            this.author = newV.author
            this.name = newV.name
        }
    }
}
</script>