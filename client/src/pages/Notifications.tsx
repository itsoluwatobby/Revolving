import { ThemeContextType } from "../posts";
import { useEffect, useState } from 'react';
import { ErrorContent } from "../components/ErrorContent";
import { useThemeContext } from "../hooks/useThemeContext";
import { useDeleteNotificationMutation, useGetNotificationQuery } from "../app/api/noficationSlice";
import NotificationComp from "../components/notifications/NotificationComp";
import SkeletonNotification from "../components/skeletons/SkeletonNotification";
import { ErrorResponse, NotificationBody, NotificationModelType } from "../data";
import { FaTrashAlt } from "react-icons/fa";

export default function Notifications() {
  const userId =  localStorage.getItem('revolving_userId') as string
  const { theme, openNotification, setOpenNotification } = useThemeContext() as ThemeContextType
  const { data, isLoading, error } = useGetNotificationQuery(userId as string)
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)
  const [notificationIds, setNotificationIds] = useState<string[]>([])
  const [notifications, setNotifications] = useState<NotificationModelType>()
  const [deleteNotifications, { isLoading: isDeleteLoading, isError }] = useDeleteNotificationMutation()

  const deleteNotification = (notificationId?: string) => {
    const notifyIds = notificationIds?.length ? [...notificationIds] : [notificationId] as string[]
    console.log(notifyIds)
  }

  useEffect(() => {
    let isMounted = true
    if(isMounted && data) setNotifications({...data})
    return () => {
      isMounted = false
    }
  }, [data])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])
  
  console.log(notifications)
  const closeModal = () => {
    setNotificationIds([])
    setOpenNotification('Hide')
  }

  return (
    <dialog open 
      className={`${openNotification === 'Open' ? 'flex' : 'scale-0 hidden'} ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'} justify-between maxscreen:flex-col p-1 h-[65%] w-1/2 maxmobile:w-[60%] rounded-md transition-all left-0 top-10 z-50 bg-slate-00 border-4 border-slate-400 border-t-0 border-l-0 border-r-0 border-b-4`}>
      <div className={`hidebars flex flex-col gap-2 w-full maxscreen:w-full maxscreen:h-full shadow-md box-border overflow-y-scroll`}>

        <div className={`sticky top-0 rounded-sm ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'} flex items-center justify-between z-10 w-full p-2 font-medium`}>
          <span className={`${theme === 'light' ? 'text-black' : 'text-white'}`}>Notifications</span>
          <div className={`flex items-center gap-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            <FaTrashAlt 
              onClick={deleteNotification}
              className={`${notificationIds?.length ? 'scale-100' : 'scale-0 hidden'} cursor-pointer transition-all hover:opacity-90 active:opacity-100`} />
            <button 
              onClick={closeModal}
              className='bg-slate-600 text-white rounded-sm text-sm p-0.5 px-1.5'>
              close
            </button>
          </div>
        </div>

        <article className={`flex flex-col h-full gap-2 w-full py-1.5 px-3`}>
          {
            isLoading ?
              <SkeletonNotification />
            :
              notifications?.notification?.length ?  
              notifications?.notification?.map(notification => (
                <NotificationComp key={notification?._id}
                  deleteNotification={deleteNotification} notificationIds={notificationIds}
                  theme={theme} notification={notification} isDeleteLoading={isDeleteLoading}
                  setOpenNotification={setOpenNotification} setNotificationIds={setNotificationIds}
                />
              ))
            : 
              <ErrorContent message='You have no followers' 
                errorMsg={errorMsg as ErrorResponse} 
                contentLength={(notifications?.notification as NotificationBody[])?.length } 
              />
          }
        </article>
      </div>
    </dialog>
  )
}
