import axios from "axios";
const instance=axios.create({
    baseURL:'https://fined.onrender.com/api',withCredentials:true
})
export default instance;