import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";
import { CommentResponseProps, DeleteResponseByAdmin } from "../../types/data";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type ResponseArgs = {
  userId: string, 
  adminId: string, 
  command: DeleteResponseByAdmin, 
  commentId?: string,
  responseId?: string,
  authorId?: string,
  response: Partial<CommentResponseProps>
}

type ResponseType = { data: CommentResponseProps[] }
// const storyAdapter: EntityAdapter<PostType> = createEntityAdapter<PostType>({
//   sortComparer: (prev, next) => next.storyDate.localeCompare(prev.storyDate)
// })

// const initialState = storyAdapter.getInitialState({})

export const responseApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createResponse: builder.mutation<CommentResponseProps, Partial<ResponseArgs>>({
      query: ({userId, commentId, response}) => ({
        url: `responses/${userId}/${commentId}`,
        method: 'POST',
        body: {...response}
      }),
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST' }, { type: 'NOTIFICATION' }, { type: 'NOTIFICATION', id: 'LIST' }, { type: 'COMMENT', id: 'LIST' }],
    }),

    updateResponse: builder.mutation<CommentResponseProps, Partial<ResponseArgs>>({
      query: ({userId, responseId, response}) => ({
        url: `responses/${userId}/${responseId}`,
        method: 'PUT',
        body: {...response}
      }),
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST'}],
    }),
    
    likeAndUnlikeResponse: builder.mutation<void, Pick<ResponseArgs, 'userId' | 'responseId'>>({
      query: ({userId, responseId}) => ({
        url: `responses/${userId}/${responseId}`,
        method: 'PATCH',
        body: userId
      }),
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST'}, { type: 'NOTIFICATION' }, { type: 'NOTIFICATION', id: 'LIST' }],
    }),
    
    // Also works for admin deleting a user comment
    deleteResponse: builder.mutation<void, Pick<ResponseArgs, 'userId' | 'responseId' | 'authorId'>>({
      query: ({userId, responseId, authorId}) => ({
        url: `responses/${userId}/${responseId}/${authorId}`,
        method: 'DELETE',
        body: userId
      }),
      invalidatesTags: [{ type: 'RESPONSE', id: 'LIST'}, { type: 'COMMENT', id: 'LIST' }],
    }),

    deleteResponsesByAdmin: builder.mutation<void, Omit<ResponseArgs, 'response' | 'storyId'>>({
      query: ({adminId, userId, responseId, command, commentId}) => ({
        url: `responses/admin/${adminId}/${userId}/${responseId}?command=${command}&commentId=${commentId}`,
        method: 'DELETE',
        body: userId
      }),
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
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as CommentResponseProps[], 'RESPONSE')
    }),

    // story comments
    getResponses: builder.query<CommentResponseProps[], string>({
      query: (commentId) => `response_in_comment/${commentId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
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