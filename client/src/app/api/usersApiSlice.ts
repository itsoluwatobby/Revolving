import { UserProps } from "../../data";
import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";

type SubscribeType = {
  meta: {
    status: number, nessage: string
  }
}

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    updateInfo: builder.mutation<UserProps, UserProps>({
      query: (user) => ({
        url: `users/updateInfo/${user?._id}`,
        method: 'PUT',
        body: {...user}
      }),
      invalidatesTags: [{ type: 'USERS' }, { type:  'USERS', id: 'LIST' }],
    }),

    followUnfollowUser: builder.mutation<string, {followerId: string, followedId: string}>({
      query: ({followerId, followedId}) => ({
        url: `users/follow_unfollow/${followerId}/${followedId}`,
        method: 'PUT',
        body: followerId
      }),
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),
    
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `users/delete/${userId}`,
        method: 'DELETE',
        body: userId
      }),
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),

    getUserById: builder.query<UserProps, string>({
      query: (id) => `users/single/${id}`,
      transformResponse: (baseQueryReturnValue: {data: UserProps}) => {
          return baseQueryReturnValue?.data
        },
      providesTags: ['USERS']
    }),

    getCurrentUser: builder.mutation<UserProps, string>({
      query: (id) => `users/single/${id}`,
      transformResponse: (baseQueryReturnValue: {data: UserProps}) => {
        return baseQueryReturnValue?.data
      },
      invalidatesTags: [{ type: 'USERS', id: 'LIST' }]
    }),
   
    getUsers: builder.query<UserProps[], void>({
      query: () => `users`,
      transformResponse: (baseQueryReturnValue: {data: UserProps[]}) => {
      //   usersAdapter.setAll(initialState, baseQueryReturnValue)
        return baseQueryReturnValue?.data
      },
      providesTags: (result) => providesTag(result as UserProps[], 'USERS')
    }),

    subscribe: builder.mutation<SubscribeType, {subscribeId: string, subscriberId: string}>({
      query: ({subscribeId, subscriberId}) => ({
        url: `users/subscribe/${subscribeId}/${subscriberId}`,
        method: 'PUT',
        body: subscriberId
      }),
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),

  })
})

export const {
  useFollowUnfollowUserMutation,
  useGetCurrentUserMutation,
  useUpdateInfoMutation,
  useDeleteUserMutation,
  useSubscribeMutation,
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