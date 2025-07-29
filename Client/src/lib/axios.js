import axios from "axios";
const instance=axios.create({
    // baseURL:'https://finedwebmvp-production.up.railway.app/api',withCredentials:true
        baseURL:'https://api.myfined.com/api',withCredentials:true
        // baseURL:'http://localhost:8000/api',withCredentials:true
})
export default instance;