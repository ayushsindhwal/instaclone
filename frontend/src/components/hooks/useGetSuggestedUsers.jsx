import { setSuggestedUsers } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux"

const useGetSuggestedUsers = () =>{
   const dispatch = useDispatch();
   useEffect(()=>{
    const fetchSuggestedUsers = async ()=>{
        try {
            const res = await axios.get("https://instaclone-ilgd.onrender.com/api/v1/user/suggested",{withCredentials: true})
           console.log(res, 'helo') 
            if(res.data.success){
                 dispatch(setSuggestedUsers(res.data.users))
            }
        } catch (error){
            console.log(error)
        }
    }
    fetchSuggestedUsers()
   },[])
}
export default useGetSuggestedUsers;