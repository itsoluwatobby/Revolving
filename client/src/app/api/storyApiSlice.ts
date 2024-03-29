import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";
import { ImageRes, PostType } from "../../types/posts";
import { Categories, UserProps } from "../../types/data";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type StoryArgs = {
  userId: string, storyId?: string, story: PostType
}

type QueryArgs = {
  category: Categories,
  page?: number, 
  limit?: number
}

type ResponseType = { data: PostType[] }

export const storyApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createStory: builder.mutation<PostType, StoryArgs>({
      query: ({userId, story}) => ({
        url: `story/${userId}`,
        method: 'POST',
        body: {...story}
      }),
      invalidatesTags: [{ type: 'STORY' }, { type: 'NOTIFICATION' }],
    }),
    
    uploadImage: builder.mutation<ImageRes, FormData>({
      query: (imageData) => ({
        url: `images/upload`,
        method: 'POST',
        body: imageData
      }),
      transformResponse: (baseQueryReturnValue: {data: ImageRes}) => {
        return baseQueryReturnValue?.data
      },
    }),

    deleteImage: builder.mutation<ImageRes, string>({
      query: (imageName) => ({
        url: `images/${imageName}`,
        method: 'DELETE',
        body: imageName
      }),
    }),

    updateStory: builder.mutation<PostType, StoryArgs>({
      query: ({userId, storyId, story}) => ({
        url: `story/${userId}/${storyId}`,
        method: 'PUT',
        body: {...story}
      }),
      invalidatesTags: [{ type: 'STORY', id: 'LIST'}],
    }),
    
    likeAndUnlikeStory: builder.mutation<void, Omit<StoryArgs, 'story'>>({
      query: ({userId, storyId}) => ({
        url: `story/${userId}/${storyId}`,
        method: 'PATCH',
        body: userId
      }),
      invalidatesTags: [{ type: 'NOTIFICATION' }, { type: 'STORY' }],
    }),
    
    deleteStory: builder.mutation<void, Omit<StoryArgs, 'story'>>({
      query: ({userId, storyId}) => ({
        url: `story/${userId}/${storyId}`,
        method: 'DELETE',
        body: userId
      }),
      invalidatesTags: [{ type: 'STORY', id: 'LIST'}],
    }),

    getStory: builder.query<PostType, string>({
      query: (id) => `story/${id}`,
      transformResponse: (baseQueryReturnValue: {data: PostType}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['STORY']
    }),

    getStoryCond: builder.mutation<PostType, string>({
      query: (id) => `story/${id}`,
      transformResponse: (baseQueryReturnValue: {data: PostType}) => {
        return baseQueryReturnValue?.data
      }
    }),
  
    getStoriesByCategory: builder.query<PostType[], QueryArgs>({
      query: ({
        category, page=1, limit=10
      }) => `story/category?category=${category}&page=${page}&limit=${limit}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const mapStories = baseQueryReturnValue?.data?.map(story => {
          return { ...story, mutualDate: story?.sharedDate ? story?.sharedDate : story?.createdAt }
        })
        const response = mapStories?.sort((prev, next) => next?.mutualDate.localeCompare(prev?.mutualDate))
        return response
      }, 
      providesTags:(result) => providesTag(result as PostType[], 'STORY')
    }),

    getStories: builder.query<PostType[], void>({
      query: () => `story`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as PostType[], 'STORY')
    }),
    
    getUserStories: builder.query<PostType[], string>({
      query: (userId) => `story/user/${userId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as PostType[], 'STORY')
    }),
    
    getStoriesWithUserId: builder.query<PostType[], string>({
      query: (userId) => `story/user/storyWithUserId/${userId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as PostType[], 'STORY')
    }),
    
    getUsersThatLikedStory: builder.query<Partial<UserProps[]>, string>({
      query: (userId) => `story/user/likesUsersInStory/${userId}`,
      transformResponse: (baseQueryReturnValue: {data: UserProps[]}) => {
        return baseQueryReturnValue.data
      }, 
      providesTags:(result) => providesTag(result as UserProps[], 'USERS')
    }),
  })
})

export const {
  useGetStoryQuery,
  useGetStoriesQuery,
  useUploadImageMutation,
  useDeleteImageMutation,
  useGetUserStoriesQuery,
  useDeleteStoryMutation,
  useCreateStoryMutation,
  useUpdateStoryMutation,
  useGetStoryCondMutation,
  useGetStoriesByCategoryQuery,
  useGetStoriesWithUserIdQuery,
  useLikeAndUnlikeStoryMutation,
  useGetUsersThatLikedStoryQuery
} = storyApiSlice

// //returns query result object 
// export const selectStoriesResult = storyApiSlice.endpoints.getStories.select()

// // creates momixed 
// const selectStoriesData = createSelector(
//   selectStoriesResult,
//   storyResult => storyResult?.data // normalized data
// )


// export const {
//   selectAll: selectAllStories,
//   selectById: selectAllStoryBy,
//   selectIds: selectStoryIds
// } = storyAdapter.getSelectors((state: PostType) => state.story)