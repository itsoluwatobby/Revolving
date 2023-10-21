import { useEffect, useState } from 'react';
import { FaTrashAlt } from "react-icons/fa";
import { ErrorContent } from "./ErrorContent";
import { ThemeContextType } from "../types/posts";
import { useThemeContext } from "../hooks/useThemeContext";
import NotificationComp from "./notifications/NotificationComp";
import useRevolvingObserver from "../hooks/useRevolvingObserver";
import SkeletonNotification from "./skeletons/SkeletonNotification";
import { ErrorResponse, NotificationBody, NotificationModelType } from "../types/data";
import { useDeleteNotificationMutation, useGetNotificationQuery } from "../app/api/noficationSlice";

export default function Notifications() {
  const userId =  localStorage.getItem('revolving_userId') as string
  const { theme, openNotification, setOpenNotification, setLoginPrompt } = useThemeContext() as ThemeContextType
  const { data, isLoading, error } = useGetNotificationQuery(userId as string)
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)
  const [notificationIds, setNotificationIds] = useState<string[]>([])
  const [notifications, setNotifications] = useState<NotificationModelType>()
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>()
  const {isIntersecting, observerRef} = useRevolvingObserver({screenPosition: '0px', threshold: 0.8})
  const [delete_all_notifications, { isLoading: isDeleteLoading, isError, error: deleteError }] = useDeleteNotificationMutation()

  const deleteNotification = async(notificationId?: string) => {
    const notifyIds = notificationIds?.length ? [...notificationIds] : [notificationId] as string[]
    try{
      await delete_all_notifications({ notificationId: notifications?._id as string, notifyIds }).unwrap()
    }
    catch(err: unknown){
      const errors = (deleteError as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
      setDeleteErrorMsg(errors?.message ?? 'An error occurred')
    }
  }

  useEffect(() => {
    let isMounted = true
    if(isMounted && isIntersecting === 'NOT_INTERSECTING' && openNotification === 'Open'){
      setOpenNotification('Hide')
    }
    return () => {
      isMounted = false
    }
  }, [isIntersecting, setOpenNotification, openNotification])

  useEffect(() => {
    let isMounted = true, timeoutId: NodeJS.Timeout;
    if(isMounted && isError){
      timeoutId = setTimeout(() => {
        setDeleteErrorMsg('')
      }, 4000)
    }
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [isError])

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
  
  const closeModal = () => {
    setNotificationIds([])
    setOpenNotification('Hide')
  }

  return (
    <div
      ref={observerRef as React.LegacyRef<HTMLDivElement>}
      key={'Notification'}
      className={`${openNotification === 'Open' ? 'flex max-h-96 w-80 maxmobile:w-[75%]' : 'scale-0 w-0 h'} ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'} transition-all justify-between maxscreen:flex-col p-1 rounded-md duration-300 absolute right-2 top-11 z-40 bg-slate-00 border-4 border-slate-400 border-t-0 border-l-0 border-r-0 border-b-4`}>
      <div className={`hidebars flex flex-col gap-2 w-full maxscreen:w-full maxscreen:h-full shadow-md box-border overflow-y-scroll`}>

        <div className={`sticky top-0 rounded-sm flex items-center justify-between z-10 w-full p-2 ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'} transition-colors font-medium`}>
          
          <span className={`${theme === 'light' ? 'text-black' : 'text-white'}`}>Notifications</span>

          <div className={`flex items-center gap-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            <FaTrashAlt 
              title='clear notifications'
              onClick={() => deleteNotification()}
              className={`${notificationIds?.length ? 'scale-100' : 'scale-0 hidden'} cursor-pointer transition-all hover:opacity-90 active:opacity-100`} 
            />
            
            <button 
              onClick={closeModal}
              className='bg-slate-600 text-white rounded-sm text-sm p-0.5 px-1.5'>
              close
            </button>
          </div>
        </div>

        <article className={`relative flex flex-col h-full gap-2 w-full py-1.5 px-3`}>
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
              <ErrorContent message='You have no notifications' 
                errorMsg={errorMsg as ErrorResponse} position="NOTIFICATION" 
                contentLength={(notifications?.notification as NotificationBody[])?.length } 
              />
          }
          <div className={`absolute ${isError ? 'scale-100' : 'scale-0'} transition-all top-6 left-8 w-[80%] rounded-md p-2 shadow-md bg-slate-500 text-center whitespace-pre-wrap text-white py-4 capitalize`}>
            {deleteErrorMsg}
          </div>
        </article>
      </div>
    </div>
  )
}
