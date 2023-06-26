import { UserProps } from "../../data";
import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";

// interface TransformResponseType extends EntityState<UserProps>{
//   baseQueryReturnValue?: UserProps[],
//   meta?: FetchBaseQueryMeta,
//   args?: void
// }

// type ReturnsThis = UserProps[] | Promise<UserProps[]>

// const usersAdapter = createEntityAdapter<UserProps>({})

// const initialState: EntityState<UserProps> = usersAdapter.getInitialState({})

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    updateInfo: builder.mutation<UserProps, UserProps>({
      query: (user) => ({
        url: `users/updateInfo/${user?._id}`,
        method: 'PUT',
        body: {...user}
      }) as any,
      invalidatesTags: [{ type:  'USERS', id: 'LIST'}],
    }),

    followUnfollowUser: builder.mutation<string, {followerId: string, followedId: string}>({
      query: ({followerId, followedId}) => ({
        url: `users/follow_unfollow/${followerId}/${followedId}`,
        method: 'PUT',
        body: followerId
      }) as any,
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),
    
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `users/delete/${userId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'USERS', id: 'LIST'}],
    }),

    getUserById: builder.query<UserProps, string>({
      query: (id) => `users/single/${id}`,
      transformResponse: (baseQueryReturnValue: {data: UserProps}) => {
          return baseQueryReturnValue?.data
        },
      providesTags: [{ type: 'USERS' }]
    }),
   
    getUsers: builder.query<UserProps[], void>({
      query: () => `users`,
      transformResponse: (baseQueryReturnValue: {data: UserProps[]}) => {
      //   usersAdapter.setAll(initialState, baseQueryReturnValue)
        return baseQueryReturnValue?.data
      },
      providesTags: (result) => providesTag(result as UserProps[], 'USERS')
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