import {create} from "zustand"
import { axiosInstance } from "../utils/axios";

export const useMessagesStoreHDFC= create((set,get)=>({
    
      millenia:[],
      setmillenia:(data)=>set({millenia:data}),
      
      getMillenia:async()=>{
            try{
                const res = await axiosInstance.get('/hdfc/millenia');
                if(res.data){
                    console.log(res.data)
                   set({millenia:res.data});
                }
            }
            catch (error) {
               console.error('Error fetching Savings data:', error);
            }

      },

      

}))
