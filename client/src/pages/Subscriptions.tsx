import { GetSubscriptionType } from "../data";
import { useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom"
import { useGetSubscriptionsQuery } from "../app/api/usersApiSlice"
import SubscriptionComp from "../components/subscription/SubscriptionComp";
import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";

export default function Subscriptions() {
  const { userId } = useParams()
  const { data, isLoading, isError } = useGetSubscriptionsQuery(userId as string)
  const { theme } = useThemeContext() as ThemeContextType
  const [yourSubscriptions, setYourSubscriptions] = useState<GetSubscriptionType>()

  useEffect(() => {
    let isMounted = true
    if(isMounted && data) setYourSubscriptions({...data})
    return () => {
      isMounted = false
    }
  }, [data])
console.log(yourSubscriptions)
  return (
    <section className={`hidebars single_page text-sm flex flex-col gap-2 w-full overflow-y-scroll`}>

      <SubscriptionComp 
        theme={theme} isLoading={isLoading}
        yourSubscriptions={yourSubscriptions as GetSubscriptionType} 
      />

    </section>
  )
}