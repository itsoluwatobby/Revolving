import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";
import { ConversationModelType, MembersType, MessageModelType, MessageStatus } from "../../data";


export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({

    // conversations
    createConversation: builder.mutation<ConversationModelType, MembersType>({
      query: ({userId, partnerId}) => ({
        url: `messages/create_conversation/${userId}/${partnerId}`,
        method: 'POST',
        body: userId
      }),
      invalidatesTags: [{ type: 'CONVERSATIONS' }, { type: 'MESSAGES', id: 'LIST' }],
    }),

    deleteConversation: builder.mutation<string, string>({
      query: (conversationId) => ({
        url: `messages/conversation/${conversationId}`,
        method: 'DELETE',
        body: conversationId
      }),
      invalidatesTags: [{ type: 'CONVERSATIONS', id: 'LIST'}],
    }),
    
    getConversations: builder.query<ConversationModelType[], string>({
      query: (userId) => `messages/conversations/${userId}`,
      providesTags: (result) => providesTag(result as ConversationModelType[], 'CONVERSATIONS'),
    }),
    
    getConversation: builder.query<ConversationModelType, string>({
      query: (conversationId) => `messages/single_conversation/${conversationId}`,
      providesTags: ['CONVERSATIONS'],
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
      invalidatesTags: [{ type: 'MESSAGES' }],
    }),

    deleteMessage: builder.mutation<string, {userId: string, messageId: string}>({
      query: ({userId, messageId}) => ({
        url: `messages/delete_message/${userId}/${messageId}`,
        method: 'DELETE',
        body: userId
      }),
      invalidatesTags: [{ type: 'MESSAGES', id: 'LIST'}],
    }),
    
    getMessages: builder.query<MessageModelType[], string>({
      query: (conversationId) => `messages/get_messages/${conversationId}`,
      providesTags: (result) => providesTag(result as MessageModelType[], 'MESSAGES'),
    }),
    
    getMessage: builder.query<MessageModelType, string>({
      query: (messageId) => `messages/${messageId}`,
      providesTags: ['MESSAGES'],
    }),

    updateMessageStatus: builder.mutation<void, {messageId: string, status: MessageStatus}>({
      query: ({messageId, status}) => ({
        url: `messages/message_status/messageId=${messageId}&status=${status}`,
        method: 'PATCH',
        body: messageId
      }),
      invalidatesTags: [{ type: 'MESSAGES', id: 'LIST'}],
    }),

  })
})

export const {
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useCloseConversationMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useGetMessagesQuery,
  useGetMessageQuery,
  useUpdateMessageStatusMutation,
} = messageApiSlice
