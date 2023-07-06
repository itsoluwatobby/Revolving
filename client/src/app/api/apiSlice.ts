import { createApi, fetchBaseQuery, BaseQueryApi, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { setCredentials, signUserOut } from '../../features/auth/authSlice'
import { AuthType } from '../../data'
import { RootState } from '../store'
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'

const BASEURL = 'http://localhost:4000/revolving'

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
    const refresh = await baseQuery('/auth/new_access_token', api, extraOptions)
    if(refresh?.data)
    api.dispatch(setCredentials({...refresh?.data} as AuthType))
    // retry the request
    result = baseQuery(args, api, extraOptions) as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
  }
  else
    api.dispatch(signUserOut())
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['USERS', 'STORY', 'COMMENT', 'RESPONSE', 'TASK', 'TASKBIN'],
  endpoints: builder => ({})
})

