import { CommentResponseProps, DeleteResponseByAdmin } from "../../data";
import { providesTag } from "../../utils/helperFunc";
import { apiSlice } from "./apiSlice";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type ResponseArgs = {
  userId: string, 
  adminId: string, 
  command: DeleteResponseByAdmin, 
  commentId?: string,
  responseId?: string,
  response: CommentResponseProps, 
  storyId: string
}

type ResponseType = { data: CommentResponseProps[] }
// const storyAdapter: EntityAdapter<PostType> = createEntityAdapter<PostType>({
//   sortComparer: (prev, next) => next.storyDate.localeCompare(prev.storyDate)
// })

// const initialState = storyAdapter.getInitialState({})

export const responseApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createResponse: builder.mutation<CommentResponseProps, Partial<ResponseArgs>>({
      query: ({userId, storyId, response}) => ({
        url: `responses/${userId}/${storyId}`,
        method: 'POST',
        body: {...response}
      }) as any,
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST' }, { type: 'COMMENT', id: 'LIST' }],
    }),

    updateResponse: builder.mutation<CommentResponseProps, Partial<ResponseArgs>>({
      query: ({userId, responseId, response}) => ({
        url: `responses/${userId}/${responseId}`,
        method: 'PUT',
        body: {...response}
      }) as any,
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST'}],
    }),
    
    likeAndUnlikeResponse: builder.mutation<void, Pick<ResponseArgs, 'userId' | 'responseId'>>({
      query: ({userId, responseId}) => ({
        url: `responses/${userId}/${responseId}`,
        method: 'PATCH',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST'}],
    }),
    
    // Also works for admin deleting a user comment
    deleteResponse: builder.mutation<void, Pick<ResponseArgs, 'userId' | 'responseId'>>({
      query: ({userId, responseId}) => ({
        url: `responses/${userId}/${responseId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST'}, { type: 'COMMENT', id: 'LIST' }],
    }),

    deleteResponsesByAdmin: builder.mutation<void, Omit<ResponseArgs, 'response' | 'storyId'>>({
      query: ({adminId, userId, responseId, command, commentId}) => ({
        url: `responses/admin/${adminId}/${userId}/${responseId}?command=${command}&commentId=${commentId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST' }, { type: 'COMMENT', id: 'LIST'}],
    }),

    getResponse: builder.query<CommentResponseProps, string>({
      query: (responseId) => `response/${responseId}`,
      transformResponse: (baseQueryReturnValue: {data: CommentResponseProps}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['RESPONSE']
    }),
  
    getUserResponsesByAdmin: builder.query<CommentResponseProps[], Partial<ResponseArgs>>({
      query: ({adminId, userId, responseId}) => `responses/admin/${adminId}/${userId}/${responseId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        //return storyAdapter.setAll(initialState, data)
        return baseQueryReturnValue?.data
      }, 
      providesTags:(result) => providesTag(result as CommentResponseProps[], 'RESPONSE')
    }),

    // story comments
    getResponses: builder.query<CommentResponseProps[], string>({
      query: (commentId) => `response_in_comment/${commentId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.responseDate.localeCompare(prev?.responseDate))
        return response
      }, 
      providesTags:(result) => providesTag(result as CommentResponseProps[], 'RESPONSE')
    }),
    
    // user comments in story
    // getUserComments: builder.query<CommentResponseProps[], Pick<ResponseArgs, 'userId' | 'storyId'>>({
    //   query: ({userId, storyId}) => `responses/user/${userId}/${storyId}`,
    //   transformResponse: (baseQueryReturnValue: ResponseType) => {
    //     const response = baseQueryReturnValue.data?.sort((prev, next) => next?.responseDate.localeCompare(prev?.responseDate))
    //     return response
    //   }, 
    //   providesTags:(result) => providesTag(result as CommentResponseProps[], 'COMMENT')
    // }),

  })
})

export const {
  useCreateResponseMutation,
  useUpdateResponseMutation,
  useLikeAndUnlikeResponseMutation,
  useGetUserResponsesByAdminQuery,
  useDeleteResponseMutation,
  useDeleteResponsesByAdminMutation,
  useGetResponsesQuery,
  useGetResponseQuery,
} = responseApiSlice

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