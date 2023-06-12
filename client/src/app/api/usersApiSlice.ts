import { FetchBaseQueryMeta } from "@reduxjs/toolkit/dist/query";
import { UserProps } from "../../data";
import { apiSlice } from "./apiSlice";
import { EntityState, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

// interface TransformResponseType extends EntityState<UserProps>{
//   baseQueryReturnValue?: UserProps[],
//   meta?: FetchBaseQueryMeta,
//   args?: void
// }

// type ReturnsThis = UserProps[] | Promise<UserProps[]>

// const usersAdapter = createEntityAdapter<UserProps>({})

// const initialState: EntityState<UserProps> = usersAdapter.getInitialState({})

function providesTag<R extends { _id: string | number }, T extends string>(resultWithIds: R[], TagType: T){
  return (
    resultWithIds ? [ 
      { type: TagType, id: 'LIST' }, 
      ...resultWithIds.map(({ _id }) => ({ type: TagType, id: _id }))
    ] 
    : 
    [{ type: TagType, id: 'LIST' }]
  )
}

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    updateInfo: builder.mutation<UserProps, UserProps>({
      query: (user) => ({
        url: `users/updateInfo/${user?._id}`,
        method: 'PUT',
        body: {...user}
      }),
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),

    followUnfollowUser: builder.mutation<string, {followerId: string, followedId: string}>({
      query: ({followerId, followedId}) => ({
        url: `users/follow_unfollow/${followerId}/${followedId}`,
        method: 'PUT',
        body: null
      }),
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),
    
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `users/delete/${userId}`,
        method: 'DELETE',
        body: null
      }),
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),

    getUserById: builder.query<UserProps, string>({
      query: (id) => `users/single/${id}`,
      providesTags: [{ type: 'USERS' }]
    }),
   
    getUsers: builder.query<UserProps[], void>({
      query: () => `users`,
      transformResponse: (baseQueryReturnValue: {data: UserProps[]}) => {
      //   usersAdapter.setAll(initialState, baseQueryReturnValue)
        return baseQueryReturnValue?.data
      },
      providesTags: (result) => providesTag(result?.data as UserProps[], 'USERS')
    })
  })
})

export const {
  useUpdateInfoMutation,
  useDeleteUserMutation,
  useFollowUnfollowUserMutation,
  useGetUserByIdQuery,
  useGetUsersQuery
} = usersApiSlice

//returns query result object 
// export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

// // creates momixed 
// const selectUsersData = createSelector(
//   selectUsersResult,
//   usersResult => usersResult?.data // normalized data
// )

// export const {
//   selectAll: selectAllUsers,
//   selectById: selectAllUserById,
//   selectIds: selectUsersIds
// } = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)