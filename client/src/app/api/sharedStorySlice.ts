import { apiSlice } from "./apiSlice";
import { SharedProps } from "../../data";
import { providesTag } from "../../utils/helperFunc";

type SharedStoryArgs = {
  userId: string, 
  storyId?: string, 
  sharedId?: string
}

type SharedResponseType = { data: SharedProps[] }

export const sharedStoryApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    shareStory: builder.mutation<SharedProps, SharedStoryArgs>({
      query: ({userId, storyId}) => ({
        url: `story/share/${userId}/${storyId}`,
        method: 'POST',
        body: userId
      }),
      invalidatesTags: [{ type: 'STORY' }, { type: 'STORY', id: 'LIST' }, { type: 'SHAREDSTORY' }],
    }),

    deleteSharedStory: builder.mutation<void, SharedStoryArgs>({
      query: ({userId, sharedId}) => ({
        url: `story/unshare/${userId}/${sharedId}`,
        method: 'PUT',
        body: userId
      }),
      invalidatesTags: [{ type: 'STORY', id: 'LIST'}, { type: 'SHAREDSTORY', id: 'LIST' }],
    }),
    
    likeAndUnlikeSharedStory: builder.mutation<void, Omit<SharedStoryArgs, 'story'>>({
      query: ({userId, sharedId}) => ({
        url: `story/share/${userId}/${sharedId}`,
        method: 'PATCH',
        body: userId
      }),
      invalidatesTags: [{ type: 'STORY', id: 'LIST' }, { type: 'SHAREDSTORY', id: 'LIST' }],
    }),

    getSharedStory: builder.query<SharedProps, string>({
      query: (sharedId) => `story/share/${sharedId}`,
      transformResponse: (baseQueryReturnValue: {data: SharedProps}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['SHAREDSTORY']
    }),

    // only for admin page
    getSharedStories: builder.query<SharedProps[], void>({
      query: () => 'story/share_getAll',
      transformResponse: (baseQueryReturnValue: SharedResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as SharedProps[], 'SHAREDSTORY')
    }),
    
    getSharedStoriesByUser: builder.query<SharedProps[], string>({
      query: (userId) => `story/share/user/${userId}`,
      transformResponse: (baseQueryReturnValue: SharedResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as SharedProps[], 'SHAREDSTORY')
    }),
  })
})

export const {
  useShareStoryMutation,
  useLikeAndUnlikeSharedStoryMutation,
  useDeleteSharedStoryMutation,
  useGetSharedStoriesQuery, // admin page
  useGetSharedStoryQuery,
  useGetSharedStoriesByUserQuery,
} = sharedStoryApiSlice


