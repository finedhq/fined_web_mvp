import axios from "axios";
const instance=axios.create({
    // baseURL:'https://finedwebmvp-production.up.railway.app/api',withCredentials:true
        baseURL:'http://srv921874.hstgr.cloud:8000/api',withCredentials:true
})
export default instance;