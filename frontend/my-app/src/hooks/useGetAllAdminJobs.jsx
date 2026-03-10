import { setAllAdminJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchAllAdminJobs = async () => {
            try {
                // Changed from "/adminjobs" to "/getadminjobs" to match backend routes
                const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, { 
                    withCredentials: true 
                });
                
                if (res.data.success) {
                    dispatch(setAllAdminJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllAdminJobs();
    }, [dispatch]) // Added 'dispatch' to the dependency array (React best practice)
}

export default useGetAllAdminJobs;