import { RootState } from '../store';
import { ApiSliceType, AuthType, RefreshTokenType } from '../../data';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { setCredentials, signUserOut } from '../../features/auth/authSlice';
import { createApi, fetchBaseQuery, BaseQueryApi, FetchBaseQueryError, FetchBaseQueryMeta, FetchArgs } from '@reduxjs/toolkit/query/react';

export const BASEURL = 'http://localhost:4000/revolving'

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
  let result = await baseQuery(args, api, extraOptions) as ApiSliceType

  if (result?.error?.originalStatus === 403 || result?.error?.status === 'PARSING_ERROR'){
    const refresh = await baseQuery('/auth/new_access_token', api, extraOptions) as RefreshTokenType
    if(refresh?.data?.data)
    api.dispatch(setCredentials({...refresh?.data?.data} as AuthType))
    // retry the request
    result = baseQuery(args, api, extraOptions) as ApiSliceType
    // QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
  }
  else if(result?.error?.originalStatus === 401 || result?.error?.status === 401) {
    api.dispatch(signUserOut())
  }
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth as unknown as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, object, FetchBaseQueryMeta>,
  tagTypes: ['USERS', 'STORY', 'SHAREDSTORY', 'COMMENT', 'RESPONSE', 'TASK', 'TASKBIN', 'SUBSCRIPTIONS', 'FOLLOWS', 'NOTIFICATION'],
  endpoints: builder => ({})
})

