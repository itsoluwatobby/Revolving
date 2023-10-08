import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";
import { DeleteChatOption, MembersType, MessageModelType, MessageStatus, UserFriends } from "../../data";
import { GetConvoType } from "../../posts";


export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // conversations
    createConversation: builder.mutation<{data: GetConvoType}, MembersType>({
      query: ({userId, partnerId}) => ({
        url: `messages/create_conversation/${userId}/${partnerId}`,
        method: 'POST',
        body: userId
      }),
      invalidatesTags: [{ type: 'CONVERSATIONS' }, { type: 'MESSAGES', id: 'LIST' }],
    }),

    deleteConversation: builder.mutation<string, string>({
      query: (conversationId) => ({
        url: `messages/delete_conversation/${conversationId}`,
        method: 'DELETE',
        body: conversationId
      }),
      invalidatesTags: [{ type: 'CONVERSATIONS', id: 'LIST'}],
    }),
    
    getConversations: builder.query<GetConvoType[], string>({
      query: (userId) => `messages/conversations/${userId}`,
      transformResponse: (baseQueryReturnValue: {data: GetConvoType[]}) => {
        const result = baseQueryReturnValue?.data?.sort((a, b) => b?.updatedAt?.localeCompare(a?.updatedAt))
        return result
      },
      providesTags: (result) => providesTag(result as GetConvoType[], 'CONVERSATIONS'),
    }),
    
    getConversation: builder.query<GetConvoType, {userId: string, conversationId: string}>({
      query: ({userId, conversationId}) => `messages/single_conversation/${userId}/${conversationId}`,
      providesTags: ['CONVERSATIONS'],
      invalidatesTags: [{ type: 'USERS' }],
    }),

    getCurrentConversation: builder.mutation<GetConvoType, {userId: string, conversationId: string}>({
      query: ({userId, conversationId}) => `messages/single_conversation/${userId}/${conversationId}`,
      transformResponse: (baseQueryReturnValue: {data: GetConvoType}) => {
        return baseQueryReturnValue?.data
      },
      invalidatesTags: [{ type: 'USERS' }],
    }),
    
    closeConversation: builder.mutation<string, string>({
      query: (conversationId) => ({
        url: `messages/close_conversation/${conversationId}`,
        method: 'PATCH',
        body: conversationId
      }),
      invalidatesTags: ['CONVERSATIONS'],
    }),

    // messages
    createMessage: builder.mutation<MessageModelType, Partial<MessageModelType>>({
      query: (messageObj) => ({
        url: `messages/create_message`,
        method: 'POST',
        body: {...messageObj}
      }),
      // invalidatesTags: [{ type: 'MESSAGES' }],
    }),
    
    editMessage: builder.mutation<MessageModelType, { userId: string, messageObj: Partial<MessageModelType> }>({
      query: ({userId, messageObj}) => ({
        url: `messages/edit_message/${userId}`,
        method: 'PUT',
        body: {...messageObj}
      }),
      // invalidatesTags: [{ type: 'MESSAGES' }],
    }),

    deleteMessage: builder.mutation<string, {userId: string, messageId: string, option: DeleteChatOption}>({
      query: ({userId, messageId, option}) => ({
        url: `messages/delete_message/${userId}/${messageId}/${option}`,
        method: 'DELETE',
        body: userId
      }),
      // invalidatesTags: [{ type: 'MESSAGES', id: 'LIST'}],
    }),
    
    getAllMessages: builder.query<MessageModelType[], string>({
      query: (conversationId) => `messages/get_messages/${conversationId}`,
      transformResponse: (baseQueryReturnValue: {data: MessageModelType[]}) => {
        return baseQueryReturnValue?.data
      },
      providesTags: (result) => providesTag(result as MessageModelType[], 'MESSAGES'),
    }),
    
    getMessage: builder.query<MessageModelType, string>({
      query: (messageId) => `messages/${messageId}`,
      providesTags: ['MESSAGES'],
    }),

    updateMessageStatus: builder.mutation<void, {messageId: string, status: MessageStatus}>({
      query: ({messageId, status}) => ({
        url: `messages/message_status?messageId=${messageId}&status=${status}`,
        method: 'PATCH',
        body: messageId
      }),
      // invalidatesTags: [{ type: 'MESSAGES', id: 'LIST'}],
    }),

  })
})

export const {
  useGetCurrentConversationMutation,
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useCloseConversationMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetAllMessagesQuery,
  useGetMessageQuery,
  useUpdateMessageStatusMutation,
} = messageApiSlice
