import { apiSlice } from "./apiSlice";
import { providesTag } from "../../utils/helperFunc";
import { NotificationBody, NotificationModelType, NotificationStatus } from "../../types/data";

type NotificationArgs = {
  isOpen?: boolean,
  notifyIds?: string[],
  notificationId: string,
  status?: NotificationStatus,
}

export const notificationSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    openedNotification: builder.mutation<string, NotificationArgs>({
      query: ({notificationId, isOpen, status}) => ({
        url: `/notification/open_notification?isOpen=${isOpen}&notificationId=${notificationId}&stats=${status}`,
        method: 'PUT',
        body: notificationId
      }),
      invalidatesTags: [{type: 'NOTIFICATION'}, { type: 'NOTIFICATION', id: 'LIST' }]
    }),

    deleteNotification: builder.mutation<string, NotificationArgs>({
      query: ({notificationId, notifyIds}) => ({
        url: `/notification/remove_notification/${notificationId}`,
        method: 'DELETE',
        body: {notifyIds}
      }),
      invalidatesTags: [{type: 'NOTIFICATION'}, { type: 'NOTIFICATION', id: 'LIST' }]
    }),
 
    getNotification: builder.query<NotificationModelType, string>({
      query: (userId) => `/notification/get_notification/${userId}`,
      transformResponse(baseQueryReturnValue: {data: NotificationModelType}) {
        const response = baseQueryReturnValue.data?.notification?.sort((prev, next) => next?.createdAt.localeCompare(prev?.createdAt))
        return {...baseQueryReturnValue.data, notification: response}
      },
      providesTags:(result) => providesTag(result?.notification as NotificationBody[], 'NOTIFICATION')
    }),
  })
})

export const {
  useGetNotificationQuery,
  useDeleteNotificationMutation,
  useOpenedNotificationMutation,
} = notificationSlice