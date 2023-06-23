import { CommentProps, DeleteCommentByAdmin } from "../../data";
import { providesTag } from "../../utils/helperFunc";
import { apiSlice } from "./apiSlice";
// import { EntityAdapter, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

type CommentArgs = {
  userId: string, 
  adminId: string, 
  command: DeleteCommentByAdmin, 
  commentId?: string, 
  comment: CommentProps, 
  storyId: string
}

type ResponseType = { data: CommentProps[] }
// const storyAdapter: EntityAdapter<PostType> = createEntityAdapter<PostType>({
//   sortComparer: (prev, next) => next.storyDate.localeCompare(prev.storyDate)
// })

// const initialState = storyAdapter.getInitialState({})

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createComment: builder.mutation<CommentProps, CommentArgs>({
      query: ({userId, storyId, comment}) => ({
        url: `comments/${userId}/${storyId}`,
        method: 'POST',
        body: {...comment}
      }) as any,
      invalidatesTags: [{ type: 'COMMENT' }],
    }),

    updateComment: builder.mutation<CommentProps, CommentArgs>({
      query: ({userId, commentId, comment}) => ({
        url: `comments/${userId}/${commentId}`,
        method: 'PUT',
        body: {...comment}
      }) as any,
      invalidatesTags: [{ type: 'COMMENT', id: 'LIST'}],
    }),
    
    likeAndUnlikeComment: builder.mutation<void, Omit<CommentArgs, 'comment'>>({
      query: ({userId, commentId}) => ({
        url: `comments/${userId}/${commentId}`,
        method: 'PATCH',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'COMMENT', id: 'LIST'}],
    }),
    
    // Also works for admin deleting a user comment
    deleteComment: builder.mutation<void, Omit<CommentArgs, 'comment'>>({
      query: ({userId, commentId}) => ({
        url: `comments/${userId}/${commentId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'COMMENT', id: 'LIST'}],
    }),

    deleteCommentsByAdmin: builder.mutation<void, Omit<CommentArgs, 'comment'>>({
      query: ({adminId, userId, commentId, command, storyId}) => ({
        url: `comments/admin/${adminId}/${userId}/${commentId}?command=${command}&storyId=${storyId}`,
        method: 'DELETE',
        body: userId
      }) as any,
      invalidatesTags: [{ type: 'COMMENT', id: 'LIST'}],
    }),

    getComment: builder.query<CommentProps, string>({
      query: (commentId) => `comment/${commentId}`,
      transformResponse: (baseQueryReturnValue: {data: CommentProps}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: ['COMMENT']
    }),
  
    getUserCommentsByAdmin: builder.query<CommentProps[], Partial<CommentArgs>>({
      query: ({adminId, userId}) => `comments/admin/${adminId}/${userId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        //return storyAdapter.setAll(initialState, data)
        return baseQueryReturnValue?.data
      }, 
      providesTags:(result) => providesTag(result as CommentProps[], 'COMMENT')
    }),

    // story comments
    getComments: builder.query<CommentProps[], string>({
      query: (storyId) => `comment_in_story/${storyId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.commentDate.localeCompare(prev?.commentDate))
        return response
      }, 
      providesTags:(result) => providesTag(result as CommentProps[], 'COMMENT')
    }),
    
    // user comments in story
    getUserComments: builder.query<CommentProps[], Pick<CommentArgs, 'userId' | 'storyId'>>({
      query: ({userId, storyId}) => `comments/user/${userId}/${storyId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.commentDate.localeCompare(prev?.commentDate))
        return response
      }, 
      providesTags:(result) => providesTag(result as CommentProps[], 'COMMENT')
    }),

  })
})

export const {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useLikeAndUnlikeCommentMutation,
  useGetUserCommentsByAdminQuery,
  useDeleteCommentMutation,
  useDeleteCommentsByAdminMutation,
  useGetCommentsQuery,
  useGetCommentQuery,
  useGetUserCommentsQuery
} = commentApiSlice

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