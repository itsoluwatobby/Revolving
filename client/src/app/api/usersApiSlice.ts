import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";
import { GetFollowsType, GetSubscriptionType, SubUser, UserFriends, UserProps } from "../../types/data";

type SubscribeType = {
  meta: {
    status: number, message: string
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
      invalidatesTags: [{ type: 'USERS' }, { type: 'USERS', id: 'LIST' }],
    }),

    followUnfollowUser: builder.mutation<string, {followerId: string, followedId: string}>({
      query: ({followerId, followedId}) => ({
        url: `users/follow_unfollow/${followerId}/${followedId}`,
        method: 'PUT',
        body: followerId
      }),
      invalidatesTags: [{ type: 'USERS' }, { type: 'NOTIFICATION' }, { type: 'FOLLOWS' }, { type: 'FRIENDS', id: 'LIST' }, { type: 'USERS', id: 'LIST'}],
    }),
    
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `users/delete/${userId}`,
        method: 'DELETE',
        body: userId
      }),
      invalidatesTags: [{ type: 'USERS' }, { type: 'USERS', id: 'LIST'}],
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
      invalidatesTags: [{ type: 'USERS' }, { type: 'SUBSCRIPTIONS' }, { type: 'USERS', id: 'LIST' }],
    }),

    getSubscriptions: builder.query<GetSubscriptionType, string>({
      query: (userId) => `users/user_subscriptions/${userId}`,
       transformResponse: (baseQueryReturnValue: {data: GetSubscriptionType}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['SUBSCRIPTIONS']
    }),
    
    getUserFollows: builder.query<GetFollowsType, string>({
      query: (userId) => `users/user_follows/${userId}`,
       transformResponse: (baseQueryReturnValue: {data: GetFollowsType}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['FOLLOWS'],
    }),

    getUserFriends: builder.query<UserFriends[], string>({
      query: (userId) => `users/user_friends/${userId}`,  
       transformResponse: (baseQueryReturnValue: {data: UserFriends[]}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: (result) => providesTag(result as UserFriends[], 'FRIENDS'),
    }),

  })
})

export const {
  useFollowUnfollowUserMutation,
  useGetCurrentUserMutation,
  useGetSubscriptionsQuery,
  useGetUserFollowsQuery,
  useGetUserFriendsQuery,
  useUpdateInfoMutation,
  useDeleteUserMutation,
  useSubscribeMutation,
  useGetUserByIdQuery,
  useGetUsersQuery,
} = usersApiSlice
