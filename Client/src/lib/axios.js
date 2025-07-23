import axios from "axios";
const instance=axios.create({
    // baseURL:'https://finedwebmvp-production.up.railway.app/api',withCredentials:true
    // baseURL:'https://finedwebmvp-production.up.railway.app/api',withCredentials:true
        baseURL:'https://srv921874.hstgr.cloud/api',withCredentials:true
})
export default instance;