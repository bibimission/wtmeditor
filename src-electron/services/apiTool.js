const axios = require('axios');

export default class ApiTool {

    constructor() {
        this.apiGirls = []
    }
    async getCharacterList(forceReload = false) {
        if (this.apiGirls.length > 0 && !forceReload) {
            return JSON.stringify(this.apiGirls)
        }
        return new Promise((resolve) => {
            axios.get('https://www.corrupted-mods.academy/mods/api/mods/').then((res) => {
                var object_keys = Object.keys(res.data)
                var ret = []
                object_keys.forEach((k) => {
                    var apiItem = res.data[k]
                    if (apiItem.type === 'girls' || apiItem.type === 'mothers') {
                        ret.push({ id: apiItem.girl_id, name: apiItem.name, thumb: apiItem.download_data.icon_link, type: apiItem.type === 'girls' ? 'student' : 'mother' })
                    }
                })
                this.apiGirls = ret
                resolve(JSON.stringify(ret))
            })
        })
    }
}