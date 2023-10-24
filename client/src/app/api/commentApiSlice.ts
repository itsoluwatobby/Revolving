import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";
import { CommentProps, DeleteCommentByAdmin } from "../../types/data";

type CommentArgs = {
  userId: string, 
  adminId: string, 
  command: DeleteCommentByAdmin, 
  commentId?: string,
  comment: Partial<CommentProps>, 
  storyId: string,
  authorId?: string
}

type ResponseType = { data: CommentProps[] }

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createComment: builder.mutation<CommentProps, Partial<CommentArgs>>({
      query: ({userId, storyId, comment}) => ({
        url: `comments/${userId}/${storyId}`,
        method: 'POST',
        body: {...comment}
      }),
      invalidatesTags: [{ type: 'COMMENT' }, { type: 'NOTIFICATION' }, { type: 'NOTIFICATION', id: 'LIST' }, { type: 'STORY' }],
    }),

    updateComment: builder.mutation<CommentProps, Partial<CommentArgs>>({
      query: ({userId, commentId, comment}) => ({
        url: `comments/${userId}/${commentId}`,
        method: 'PUT',
        body: {...comment}
      }),
      invalidatesTags: [{ type: 'COMMENT', id: 'LIST'}],
    }),
    
    likeAndUnlikeComment: builder.mutation<void, Pick<CommentArgs, 'userId' | 'commentId'>>({
      query: ({userId, commentId}) => ({
        url: `comments/${userId}/${commentId}`,
        method: 'PATCH',
        body: userId
      }),
      invalidatesTags: [{ type: 'COMMENT'}, { type: 'NOTIFICATION' }, { type: 'NOTIFICATION', id: 'LIST' }],
    }),
    
    // Also works for admin deleting a user comment
    deleteComment: builder.mutation<void, Pick<CommentArgs, 'userId' | 'commentId' | 'authorId'>>({
      query: ({userId, commentId, authorId}) => ({
        url: `comments/${userId}/${commentId}/${authorId}`,
        method: 'DELETE',
        body: userId
      }),
      invalidatesTags: [{ type: 'COMMENT', id: 'LIST'}, { type: 'STORY' }],
    }),

    deleteCommentsByAdmin: builder.mutation<void, Omit<CommentArgs, 'comment'>>({
      query: ({adminId, userId, commentId, command, storyId}) => ({
        url: `comments/admin/${adminId}/${userId}/${commentId}?command=${command}&storyId=${storyId}`,
        method: 'DELETE',
        body: userId
      }),
      invalidatesTags: [{ type: 'COMMENT', id: 'LIST'}, { type: 'STORY', id: 'LIST' }, { type: 'STORY' }],
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
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as CommentProps[], 'COMMENT')
    }),

    // story comments
    getComments: builder.query<CommentProps[], string>({
      query: (storyId) => `comment_in_story/${storyId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return response
      }, 
      providesTags:(result) => providesTag(result as CommentProps[], 'COMMENT')
    }),
    
    // user comments in story
    getUserComments: builder.query<CommentProps[], Pick<CommentArgs, 'userId' | 'storyId'>>({
      query: ({userId, storyId}) => `comments/user/${userId}/${storyId}`,
      transformResponse: (baseQueryReturnValue: ResponseType) => {
        const response = baseQueryReturnValue.data?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
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

