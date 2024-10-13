<template>
    <div @click="imageClick($event)" :class="{ 'wrong': computeNeedConversion }" class="p-relative">
        <img :src="computeSrc" v-if="computeMediaType == 'img'" loading="lazy">
        <video :src="computeSrc" :class="{ 'tiny': isTiny }" v-if="computeMediaType == 'video'" muted @mouseover="onHover($event)" ref="videoPlayer" @loadeddata="onLoad($event)" loading="lazy"></video>
        <div class="overlay absolute-center" :class="{ 'hidden': !isConverting }">
            <q-spinner class="absolute-center" color="white" size="3em" />
        </div>
        <canvas ref="canvas" class="hidden"></canvas>
        <video ref="out" autoplay loop class="hidden"></video>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import * as whammy from 'assets/whammy'
import { Buffer } from 'buffer'

export default defineComponent({
    props: {
        src: String,
        forceVideo: {
            type: Boolean,
            default: false
        }
    },
    emits: ['click', 'change'],
    data: function () {
        return {
            isConverting: false,
            imgFormats: ['jpg', 'gif', 'png', 'webp'],
            videoFormats: ['webm', 'avi', 'mp4'],
            realSrc: '',
            isTiny: false
        }
    },
    mounted: function () {
        this.realSrc = this.src;
    },
    methods: {
        imageClick(e) {
            if (!this.isConverting && this.computeNeedConversion) {
                this.isConverting = true;
                var type = this.computeMediaType;
                if (this.realSrc.split(".")[1] == 'gif' || this.forceVideo) {
                    type = "video";
                }
                if (type == "img") {
                    window.ipcRenderer.invoke('img:convert:webp', { img: this.realSrc }).then((newPath) => {
                        if (newPath) {
                            this.realSrc = newPath;
                        }
                        this.isConverting = false;
                    });
                } else if (type == "video") {
                    if (this.realSrc.split(".")[1] == 'webp') {
                        window.ipcRenderer.invoke('img:getFrames', { img: this.realSrc }).then((success) => {
                            this.realSrc = this.realSrc.split(".")[0] + ".webm";
                            this.isConverting = false;
                        });
                    } else {
                        window.ipcRenderer.invoke('img:convert:webm', { img: this.realSrc }).then((newPath) => {
                            if (newPath) {
                                this.realSrc = newPath;
                            }
                            this.isConverting = false;
                        });
                    }
                }
            } else if (this.isTiny) {
                this.isConverting = true;
                window.ipcRenderer.invoke('webm:resize', { img: this.realSrc }).then((newPath) => {
                    if (newPath) {
                        this.realSrc = newPath;
                    }
                    this.isConverting = false;
                });
            } else if (e.ctrlKey) {
                console.log('remove BG')
                window.ipcRenderer.invoke('img:remove-bg', { img: this.realSrc }).then((newPath) => {
                    if (newPath) {
                        this.realSrc = newPath;
                    }
                    this.isConverting = false;
                });
            }
            else {
                this.$emit('click', this.realSrc)
            }
        },
        isVideoFormat(fp) {
            return this.videoFormats.includes(fp.split(".")[1]);
        },
        isImgFormat(fp) {
            return this.imgFormats.includes(fp.split(".")[1]);
        },
        onHover(e) {
            if (e.target.paused) {
                e.target.play();
            }
        },
        onLoad(e) {
            this.isTiny = e.target.videoWidth < 600;
        }
    },
    computed: {
        computeMediaType() {
            return this.isImgFormat(this.realSrc) ? 'img' : (this.isVideoFormat(this.realSrc) ? 'video' : '');
        },
        computeNeedConversion() {
            var type = this.computeMediaType;
            if (type == 'img') {
                return this.realSrc.split(".")[1] != "webp" || this.forceVideo
            } else if (type == "video") {
                return this.realSrc.split(".")[1] != "webm"
            } else {
                return false;
            }
        },
        computeSrc() {
            return this.realSrc;
        }
    }
})
</script>
<style>
.wrong {
    outline: 5px red solid;
}

.tiny {
    outline: 5px yellow solid;
}

.overlay {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transform: none;
}
</style>