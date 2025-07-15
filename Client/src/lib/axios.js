import axios from "axios";
const instance=axios.create({
    baseURL:'https://fined-web-mvp-r3r9.vercel.app/api',withCredentials:true
})
export default instance;