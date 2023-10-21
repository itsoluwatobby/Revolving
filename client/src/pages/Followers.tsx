import { useEffect, useState } from 'react';
import { ThemeContextType } from "../types/posts";
import { LeftSection } from "../components/LeftSection";
import { useNavigate, useParams } from "react-router-dom";
import { useThemeContext } from "../hooks/useThemeContext";
import FollowsComp from "../components/follows/FollowsComp";
import { ErrorResponse, GetFollowsType } from "../types/data";
import { useGetUserFollowsQuery } from "../app/api/usersApiSlice";

export default function Followers() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { theme } = useThemeContext() as ThemeContextType
  const { data, isLoading, error } = useGetUserFollowsQuery(userId as string)
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)
  const [yourFollowers, setYourFollowers] = useState<GetFollowsType>()

  useEffect(() => {
    let isMounted = true
    if(isMounted && data) setYourFollowers({...data})
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
        <FollowsComp 
          yourFollowers={yourFollowers as GetFollowsType} 
          theme={theme} isLoading={isLoading} errorMsg={errorMsg as ErrorResponse}
        />
      </div>

    </section>
  )
}