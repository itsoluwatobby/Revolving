import { useParams } from "react-router-dom"
import { PostType, ThemeContextType } from "../posts"
import { useWordCount } from "../hooks/useWordCount"
import { TextRules } from "../fonts";
import { BsArrowBarRight } from 'react-icons/bs';
import { useEffect, useState } from "react";
import { WindowScroll } from "../components/WindowScroll";
import Aside from "../components/singlePost/Aside";
import ArticleComp from "../components/singlePost/ArticleComp";
import { ErrorResponse, UserProps } from "../data";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useFollowUnfollowUserMutation, useGetUserByIdQuery } from "../app/api/usersApiSlice";
import { useGetStoriesQuery, useGetStoryQuery } from "../app/api/storyApiSlice";
import { useThemeContext } from "../hooks/useThemeContext";

const specialFont = "first-line:uppercase first-line:tracking-widest first-letter:text-7xl first-letter:font-bold first-letter:text-white first-letter:mr-3 first-letter:float-left"

export default function SingleStoryPage() {
  const { storyId } = useParams() as {storyId: string}
  const currentUserId = useSelector(selectCurrentUser)
  const currentId = localStorage.getItem('revolving_userId') as string
  const [sidebar, setSidebar] = useState<boolean>(false);
  const { setLoginPrompt, loginPrompt } = useThemeContext() as ThemeContextType
  
  const {data: user, refetch} = useGetUserByIdQuery(currentId)
  const [followUnfollowUser, { isLoading: isMutating, 
    error: followError,  isError: isFollowError, 
    isSuccess: isFollowSuccess }] = useFollowUnfollowUserMutation()
  const { data: target, isLoading, isError, error } = useGetStoryQuery(storyId);
  const { data, isLoading: loading } = useGetStoriesQuery()
  const [stories, setStories] = useState<PostType[]>([])
  const [targetStory, setTargetStory] = useState<PostType>();

  let averageReadingTime = useWordCount(targetStory?.body as string)
  const watchWords = TextRules.keywords as string

  const end = averageReadingTime.split(' ')[1]
  averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end;

  useEffect(() => {
    let isMounted = true
    isMounted ? setTargetStory(target as PostType) : null
    return () => {
      isMounted = false
    }
  }, [target])

  useEffect(() => {
    let isMounted = true
    isMounted ? setStories(data as PostType[]) : null
    return () => {
      isMounted = false
    }
  }, [data])

  const followOrUnfollow = async() => {
    try{
      const {userId} = targetStory as PostType
      const requestIds = { followerId: currentId, followedId: userId }
    
      await followUnfollowUser(requestIds).unwrap()
      await refetch()     
      isFollowSuccess && toast.success('Success!!', {
                      duration: 2000, icon: '👋', style: {
                        background: '#1E90FF'
                      }
                    })
    }
    catch(err: unknown){
      const errors = followError as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isFollowError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }
  
  const bodyContent = targetStory ? targetStory?.body.split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-600 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'text-red-600 bg-gray-600 rounded-sm' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  return (
    <WindowScroll>
      <main className={`single_page h-full ${loginPrompt == 'Open' ? 'opacity-40 transition-all' : null} box-border max-w-full flex-auto flex flex-col gap-4 drop-shadow-2xl`}>
        <div className="flex h-full">
          {Array.isArray(stories) && stories.length 
            && <Aside 
            stories={stories as PostType[]} sidebar={sidebar} 
            setSidebar={setSidebar} 
          />}
          <ArticleComp 
            story={targetStory as PostType} 
            bodyContent={bodyContent as JSX.Element[]}
            averageReadingTime={averageReadingTime} 
            sidebar={sidebar} isLoading={isLoading} isError={isError} isMutating={isMutating}
            error={error as {error: string}} user={user as UserProps} 
            followOrUnfollow={followOrUnfollow}
          />
        </div>
        <BsArrowBarRight 
          onClick={() => setSidebar(true)}
          className={`fixed md:hidden left-0 top-[40%] opacity-30 animate-bounce bg-slate-400 cursor-pointer rounded-tr-md rounded-br-md hover:opacity-80 p-1 text-[30px]`} />
      </main>
    </WindowScroll>
  )
}
