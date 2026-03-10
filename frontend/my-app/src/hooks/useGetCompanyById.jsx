import { setSingleCompany } from '@/redux/companySlice'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSingleCompany = async () => {
            try {
                // 🔥 FIXED: Changed /get/ to /getcompany/ to match your backend route:
                // router.route("/getcompany/:id").get(isAuth, getCompanyById);
                const res = await axios.get(`${COMPANY_API_END_POINT}/getcompany/${companyId}`, {
                    withCredentials: true
                });

                console.log("Fetched Company Data:", res.data.company);

                if (res.data.success) {
                    dispatch(setSingleCompany(res.data.company));
                }
            } catch (error) {
                console.error("Error fetching single company:", error);
            }
        };

        // Only attempt to fetch if a valid companyId exists
        if (companyId) {
            fetchSingleCompany();
        }
    }, [companyId, dispatch]); 
};

export default useGetCompanyById;