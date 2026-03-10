import { setCompanies } from '@/redux/companySlice'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllCompanies = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                // Double check COMPANY_API_END_POINT in your constants file. 
                // It should be: http://localhost:8000/api/v1/company
                const res = await axios.get(`${COMPANY_API_END_POINT}/getcompany`, {
                    withCredentials: true
                });

                if (res.data.success) {
                    dispatch(setCompanies(res.data.companies));
                }
            } catch (error) {
                console.log("Error fetching companies:", error);
                
                // 🔥 CRITICAL FIX: If the request fails (404 or 401), 
                // clear the Redux state so you don't see the previous user's data.
                dispatch(setCompanies([]));
            }
        }
        fetchCompanies();
    }, [dispatch]); // Added dispatch to dependency array for best practice
}

export default useGetAllCompanies;