import { UserProps } from "../data";
import { useEffect, useState } from 'react';
import { Link, useParams } from "react-router-dom"
import { useGetSubscriptionsQuery } from "../app/api/usersApiSlice"

export default function Subscriptions() {
  const { userId } = useParams()
  const { data, isLoading, isError } = useGetSubscriptionsQuery(userId as string)
  const [yourSubscriptions, setYourSubscriptions] = useState<Partial<UserProps[]>>()

  useEffect(() => {
    let isMounted = true
    if(isMounted && data) setYourSubscriptions([...data])
    return () => {
      isMounted = false
    }
  }, [data])

  return (
    <div>Subscriptions</div>
  )
}