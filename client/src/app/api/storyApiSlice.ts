import { Categories } from "../../data";
import { PostType } from "../../posts";
import { apiSlice } from "./apiSlice";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type StoryArgs = {
  userId: string, storyId?: string, story: PostType
}

type ResponseType = { data: PostType[] }
// const storyAdapter: EntityAdapter<PostType> = createEntityAdapter<PostType>({
//   sortComparer: (prev, next) => next.storyDate.localeCompare(prev.storyDate)
// })

// const initialState = storyAdapter.getInitialState({})

function providesTag<R extends { _id: string | number }, T extends string>(resultWithIds: R[] | undefined, TagType: T){
  console.log({resultWithIds})
  return (
    resultWithIds ? [ 
      { type: TagType, id: 'LIST' }, 
      ...resultWithIds.map(({ _id }) => ({ type: TagType, id: _id }))
    ] 
    : 
    [{ type: TagType, id: 'LIST' }]
  )
}

export const storyApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createStory: builder.mutation<PostType, StoryArgs>({
      query: ({userId, story}) => ({
        url: `story/${userId}`,
        method: 'POST',
        body: {...story}
      }) as any,
      invalidatesTags: [{ type: 'STORY' }],
    }),

    updateStory: builder.mutation<PostType, StoryArgs>({
      query: ({userId, storyId, story}) => ({
        url: `story/${userId}/${storyId}`,
        method: 'PUT',
        body: {...story}
      }) as any,
      invalidatesTags: [{ type: 'STORY', id: 'LIST'}],
    }),
    
    likeAndUnlikeStory: builder.mutation<void, Omit<StoryArgs, 'story'>>({
      query: ({userId, storyId}) => ({
        url: `story/${userId}/${storyId}`,
        method: 'PATCH',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'STORY', id: 'LIST'}],
    }),
    
    deleteStory: builder.mutation<void, Omit<StoryArgs, 'story'>>({
      query: ({userId, storyId}) => ({
        url: `story/${userId}/${storyId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'STORY', id: 'LIST'}],
    }),

    getStory: builder.query<PostType, string>({
      query: (id) => `story/${id}`,
      transformResponse: (baseQueryReturnValue: {data: PostType}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['STORY']
    }),
  
    getStoriesByCategory: builder.query<PostType[], Categories>({
      query: (category) => `story/category?category=${category}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        //return storyAdapter.setAll(initialState, data)
        return baseQueryReturnValue?.data
      }, 
      providesTags:(result) => providesTag(result?.data, 'STORY')
    }),

    getStories: builder.query<PostType[], void>({
      query: () => 'story',
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.storyDate.localeCompare(prev?.storyDate))
        console.log(response)
        return response
      }, 
      providesTags:(result) => providesTag(result?.data as PostType[], 'STORY')
    }),
    
    getUserStories: builder.query<PostType[], string>({
      query: (userId) => `story/user/${userId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.storyDate.localeCompare(prev?.storyDate))
        console.log(response)
        return response
      }, 
      providesTags:(result) => providesTag(result?.data as PostType[], 'STORY')
    }),

  })
})

export const {
  useCreateStoryMutation,
  useUpdateStoryMutation,
  useLikeAndUnlikeStoryMutation,
  useDeleteStoryMutation,
  useGetStoriesByCategoryQuery,
  useGetStoriesQuery,
  useGetStoryQuery,
  useGetUserStoriesQuery
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