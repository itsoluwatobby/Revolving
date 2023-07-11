// import { useEffect } from "react";
// import { axiosPrivate } from "../api/axiosPost";
// import { useSelector } from "react-redux";
// import { selectCurrentToken } from "../features/auth/authSlice";
// import { useNewAccessTokenMutation } from "../app/api/authApiSlice";
// import { AuthType } from "../data";

// export default function useAxiosPrivate() {
//   const token = useSelector(selectCurrentToken)
//   const [getRefreshToken, { data }] = useNewAccessTokenMutation()

//   useEffect(() => {
//     const requestInterceptors: number = axiosPrivate.interceptors.request.use(
//       config => {
//         if(!config.headers['Authorization']){
//           config.headers['Authorization'] = `Bearer ${token}`
//         }
//         return config
//       }, (error) => Promise.reject(error)
//     )

//     const responseInterceptors: number = axiosPrivate.interceptors.response.use(
//       response => response,
//       async(error) => {
//         const prevRequest = error?.config
//         if(error?.response?.status == 403 && !prevRequest?.sent){
//           prevRequest.sent = true;
//           await getRefreshToken()
//           const newAccessToken = data as unknown as {data: AuthType}
//           prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
//           return axiosPrivate(prevRequest)
//         }
//         return Promise.reject(error)
//       }
//     )

//     return () => {
//       axiosPrivate.interceptors.response.eject(requestInterceptors)
//       axiosPrivate.interceptors.response.eject(responseInterceptors)
//     }
//   }, [token, getRefreshToken])

//   return axiosPrivate
// }