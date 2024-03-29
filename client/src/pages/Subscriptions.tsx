import { useEffect, useState } from 'react';
import { ThemeContextType } from "../types/posts";
import { LeftSection } from "../components/LeftSection";
import { useNavigate, useParams } from "react-router-dom";
import { useThemeContext } from "../hooks/useThemeContext";
import { ErrorResponse, GetSubscriptionType } from "../types/data";
import { useGetSubscriptionsQuery } from "../app/api/usersApiSlice";
import SubscriptionComp from "../components/subscription/SubscriptionComp";

export default function Subscriptions() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { theme } = useThemeContext() as ThemeContextType
  const { data, isLoading, error } = useGetSubscriptionsQuery(userId as string)
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)
  const [yourSubscriptions, setYourSubscriptions] = useState<GetSubscriptionType>()

  useEffect(() => {
    let isMounted = true
    if(isMounted && data) setYourSubscriptions({...data})
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

  return (
    <section className={`w-full flex`}>

      <LeftSection />

      <div className={`hidebars single_page text-sm flex flex-col w-full md:px-6 px-3 overflow-y-scroll`}>
        <button 
          onClick={() => navigate(-1)}
          className={`self-start ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-700'} p-2 py-1 rounded-sm`}
          >Return</button>
        <SubscriptionComp 
          yourSubscriptions={yourSubscriptions as GetSubscriptionType} 
          theme={theme} isLoading={isLoading} errorMsg={errorMsg as ErrorResponse}
        />
      </div>

    </section>
  )
}