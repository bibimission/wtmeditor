const axios = require('axios');

export default class ApiTool{
    
    async getCharacterList(){
        return new Promise((resolve)=>{
            axios.get('https://wtm.ninoss.fr/api?user_query=get_girls_list').then((res)=>{
                var data = res
                resolve(data?.data?.data)
            })
        })
    }
}