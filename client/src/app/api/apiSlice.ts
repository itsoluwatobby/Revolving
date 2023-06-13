import { createApi, fetchBaseQuery, BaseQueryApi } from '@reduxjs/toolkit/query/react'
import { setCredentials, signOut } from '../../features/auth/authSlice'
import { AuthType } from '../../data'
import { RootState } from '../store'

const BASEURL = 'http://localhost:4000/revolving'
// const AUTHURL = 'http://localhost:4000/revolving/auth'
// const USERSURL = 'http://localhost:4000/revolving'

const baseQuery = fetchBaseQuery({
  baseUrl: BASEURL,
  credentials: 'include',
  prepareHeaders: (headers: Headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if(token){
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  }
})

const baseQueryWithReAuth = async(args: string, api: BaseQueryApi, extraOptions: object) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 403){
    console.log('sending refresh token')
    const refresh = await baseQuery('/auth/new_access_token', api, extraOptions)
    console.log(refresh)
    if(refresh?.data)
    // const _id = api.getState().auth._id
    // store the new token
    api.dispatch(setCredentials({...refresh?.data} as AuthType))
    // retry the request
    result = baseQuery(args, api, extraOptions)
  }
  else
    api.dispatch(signOut())
  
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['USERS', 'STORY'],
  endpoints: builder => ({})
})
