<template>
  <div>
    <div class="pageBody">
      <div class="col editPanel">
        <q-bar class="bg-primary">Place</q-bar>
        <q-select :options="placeOptions" clearable v-model="videoPlace" @update:model-value="onChange"></q-select>
        <ClothingPicker v-model="videoClothing" ref="clothesPicker" @stripAction="onStrip" @update:model-value="onChange"></ClothingPicker>
        <MoodPicker ref="moodPicker" v-model="videoMood" @update:model-value="onChange"></MoodPicker>
      </div>
      <div v-if="computeVideos.length > 0" class="col mediaPlayer">
        <CustomMedia :src="computeVideos[videoInEdit]" :forceVideo="true"></CustomMedia>
        <div class="title">{{ videoMainAction }}</div>
        <div class="title">{{ videoName }}</div>
        <div class="navBar">
          <q-btn color="orange" glossy @click="changeIndex(-1)">Prec.</q-btn>
          <span>{{ videoInEdit + '/' + computeVideos.length }}</span>
          <q-btn color="orange" glossy @click="changeIndex(1)">Next.</q-btn>
        </div>
      </div>
      <div class="col editPanel">
        <q-bar class="bg-primary">Other People</q-bar>
        <div class="peopleSelector">
          <div v-for="(o, i) in partyOptions" :key="i" class="peopleOption" @click="toggleParty(o)" :class="{ 'active': activeParties.find(t => t == o.value) }">
            <img :src="'/img/people/' + o.img">
          </div>
        </div>
        <VideoActionPicker v-model="videoActions" ref="actionPicker" @update:model-value="onActionChange"></VideoActionPicker>
      </div>
    </div>

  </div>
</template>
<script>
import { defineComponent } from 'vue'
import CustomMedia from './CustomMedia.vue';
import VideoActionPicker from './selectors/VideoActionPicker.vue';
import ClothingPicker from './selectors/ClothingPicker.vue';
import MoodPicker from './selectors/MoodPicker.vue';

export default defineComponent({
  components: {
    CustomMedia,
    VideoActionPicker,
    ClothingPicker,
    MoodPicker
  },
  props: {
    videos: Array
  },
  emits: ['change'],
  data: function () {
    return {
      actualVideos: [],
      videoInEdit: 0,
      videoName: '',

      videoMainAction: '',
      videoActions: [],
      videoTags: [],
      videoClothing: [],
      videoPlace: null,
      videoMood: null,

      placeOptions: [
        { label: 'Bathroom', value: 'bathroom' },
        { label: 'Bar', value: 'bar' },
        { label: 'Beach', value: 'beach' },
        { label: 'Cafeteria', value: 'cafeteria' },
        { label: 'Class', value: 'class' },
        { label: 'Clinic', value: 'clinic' },
        { label: 'Coffee Shop', value: 'coffee_shop' },
        { label: 'Glory hole', value: 'glory_hole' },
        { label: 'Home', value: 'home' },
        { label: 'Locker Room', value: 'locker_room' },
        { label: 'Mall', value: 'mall' },
        { label: 'Office', value: 'office' },
        { label: 'Park', value: 'park' },
        { label: 'Pier', value: 'pier' },
        { label: 'Shower', value: 'shower' },
        { label: 'Teacher\'s lounge', value: 'lounge' },
      ],
      partyOptions: [
        { label: 'Alone', value: '', img: 'none.png' },
        { label: 'Woman', value: 'tp_fem', img: 'woman.png' },
        { label: 'Man', value: 'tp_male', img: 'man.png' },
      ],
      activeParties: [''],
    }
  },
  methods: {
    imageChanged() {
      if (this.computeVideos.length > 0) {
        this.videoTags = []
        this.videoClothing = []
        this.videoActions = []
        this.videoPlace = null
        this.activeParties = []
        this.videoName = this.computeVideos[this.videoInEdit].split('/').slice(-1)[0]
        this.videoName = this.removeDigits(this.videoName)

        var tokens = this.videoName.split('.')[0].split('-');
        var mainActions = tokens[0].split(',')

        if (tokens.length > 1) {
          tokens[1].split(',').forEach((t) => {
            this.videoTags.push(t)
          })
        }
        this.videoMainAction = mainActions[0]
        if (this.videoMainAction.split('gloryhole').length > 1) {
          this.videoMainAction = this.videoMainAction.split('_').slice(1, 50).join('_')
          this.videoTags.push('glory_hole')
          this.videoTags.push(this.videoMainAction)
        }
        this.videoMood = this.$refs.moodPicker.parse(this.videoTags)
        this.videoActions = this.$refs.actionPicker.parseTags(mainActions, false)
        this.videoClothing = this.$refs.clothesPicker.parseTags(this.videoTags, false)
        this.videoPlace = this.placeOptions.find(p => this.videoTags.includes(p.value))
        var parties = this.partyOptions.filter(p => this.videoTags.includes(p.value))
        parties.forEach((p) => {
          this.activeParties.push(p.value)
        })
        if (this.activeParties.length == 0) {
          this.activeParties.push('')
        }
      }
    },
    onHover(e) {
      if (e.target.paused) {
        e.target.play();
      }
    },
    onChange() {
      setTimeout(() => {
        var subTags = []
        var newFileName = this.computeVideos[this.videoInEdit].split('/').slice(0, -1).join('/') + '/'
          + (this.videoPlace?.value == 'glory_hole' ? 'gloryhole_' : '')
          + this.videoMainAction
        if (this.videoClothing.length > 0) {
          subTags = subTags.concat(this.videoClothing)
        }
        if (this.activeParties[0] != '') {
          subTags = subTags.concat(this.activeParties)
        }
        if (this.videoMood != null) {
          subTags.push(this.videoMood)
        }
        if (this.videoPlace != null && this.videoPlace.value != 'glory_hole') {
          subTags.push(this.videoPlace.value)
        }
        if (subTags.length > 0) {
          newFileName += '-' + subTags.join(',')
        }
        newFileName += (Math.floor(Math.random() * 2000)) + "." + this.computeVideos[this.videoInEdit].split(".").slice(-1);
        window.ipcRenderer.send('img:rename', { oldPath: this.computeVideos[this.videoInEdit], newPath: newFileName });
        this.actualVideos[this.videoInEdit] = newFileName;
        this.imageChanged()
        this.$emit("change");
      }, 200);
    },
    changeIndex(nb) {
      if (this.videoInEdit + nb >= this.computeVideos.length) {
        this.videoInEdit = 0
      }
      else if (this.videoInEdit + nb < 0) {
        this.videoInEdit = this.computeVideos.length - 1
      } else {
        this.videoInEdit += nb
      }
      this.imageChanged()
    },
    removeDigits(str) {
      return str.replace(/[0-9]/g, '')
    },
    onStrip(clothe) {
      if (clothe != '') {
        this.videoMainAction = 'strip_' + clothe
      }
      this.onChange()
    },
    onActionChange(actions) {
      if (actions.length > 0) {
        this.videoMainAction = actions[0]
        this.onChange()
      }
    },
    toggleParty(p) {
      if (p.value === '') {
        this.activeParties = ['']
      } else {
        this.activeParties = this.activeParties.filter((o) => o !== '')
        if (this.activeParties.filter((o) => o == p.value).length > 0) {
          this.activeParties = this.activeParties.filter((o) => o !== p.value)
        } else {
          this.activeParties.push(p.value)
        }
      }
      this.onChange()
    }
  },
  computed: {
    computeVideos() {
      return this.actualVideos;
    }
  },
  created() {
    this.videos.forEach((v) => {
      this.actualVideos.push(v);
    });
  },
  mounted() {
    this.imageChanged()
  }
})
</script>
<style>
.pageBody {
  display: flex;
  justify-content: space-between;
  align-items: start;
  flex-flow: row wrap;
}

.navBar {
  width: 100%;
  display: flex;
  justify-content: center;
  color: black;
  font-size: 3vh;
}

.title {
  display: flex;
  justify-content: center;
  color: black;
  font-size: 3vh;
}

.mediaPlayer {
  flex-basis: 20vw;
  display: flex;
  justify-content: center;
}

.wrong {
  outline: 3px red solid;
}

.imgGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
}

.gridContainer {
  width: 100%;
}

.selected {
  outline: 3px skyblue solid;
}

.col {
  display: inline-block;
  vertical-align: top;
}

.editPanel {
  background-color: pink;
}

.peopleSelector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-column-gap: 0.5vw;
}

.peopleOption {
  background-color: white;
  border-radius: 2vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5vh;
  cursor: pointer;
}

.peopleOption.active {
  outline: darkmagenta solid 2px;
}
</style>