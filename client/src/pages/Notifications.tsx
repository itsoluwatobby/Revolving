import { ThemeContextType } from "../posts";
import { useEffect, useState } from 'react';
import { LeftSection } from "../components/LeftSection";
import { useNavigate, useParams } from "react-router-dom";
import { useThemeContext } from "../hooks/useThemeContext";
import { ErrorResponse, NotificationModelType } from "../data";
import { useGetNotificationQuery } from "../app/api/noficationSlice";
import NotificationComp from "../components/notifications/NotificationComp";

export default function Notifications() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { theme } = useThemeContext() as ThemeContextType
  const { data, isLoading, error } = useGetNotificationQuery(userId as string)
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)
  const [notifications, setNotifications] = useState<NotificationModelType>()

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

  return (
    <section className={`w-full flex`}>

      <LeftSection />

      <div className={`hidebars single_page text-sm flex flex-col w-full md:px-6 px-3 overflow-y-scroll`}>
        <button 
          onClick={() => navigate(-1)}
          className={`self-start ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-700'} p-2 py-1 rounded-sm`}
          >Return</button>
        <NotificationComp 
          notifications={notifications as NotificationModelType} 
          theme={theme} isLoading={isLoading} errorMsg={errorMsg as ErrorResponse}
        />
      </div>

    </section>
  )
}