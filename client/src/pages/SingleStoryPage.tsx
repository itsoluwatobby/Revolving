import { useParams } from "react-router-dom"
import { usePostContext } from "../hooks/usePostContext"
import { PostContextType, PostType } from "../posts"
import { useWordCount } from "../hooks/useWordCount"
import { TextRules } from "../fonts";
import { BsArrowBarRight } from 'react-icons/bs';
import { useEffect, useState } from "react";
import { WindowScroll } from "../components/WindowScroll";
import Aside from "../components/singlePost/Aside";
import ArticleComp from "../components/singlePost/ArticleComp";
import useSWRMutation from 'swr/mutation';
import { postAxios, posts_endPoint, user_endPoint } from "../api/axiosPost";
import { useSWRConfig } from 'swr';
import useGetUsers from "../hooks/useGetUsers";
import { followUnfollowUserOption } from "../api/userApiOptions";
import useAuthenticationContext from "../hooks/useAuthenticationContext";
import { AuthenticationContextType, ErrorResponse, UserProps } from "../data";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";

const specialFont = "first-line:uppercase first-line:tracking-widest first-letter:text-7xl first-letter:font-bold first-letter:text-white first-letter:mr-3 first-letter:float-left"

export default function SingleStoryPage() {
  const { storyId } = useParams()
  const { followUnfollowUser } = useGetUsers()
  const { mutate } = useSWRConfig()
  const { trigger, error, isMutating } = useSWRMutation<PostType>(posts_endPoint, async() => {
    const res = await postAxios.get(`${posts_endPoint}/${storyId}`)
    return res?.data?.data
  })
  const { user } = useAuthenticationContext() as AuthenticationContextType
  const currentuserId = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const [sidebar, setSidebar] = useState<boolean>(false);
  const [titleFocus, setTitleFocus] = useState<boolean>(false);
  const [targetStory, setTargetStory] = useState<PostType | null>(null);
  const { posts } = usePostContext() as PostContextType

  console.log({currentuserId})

  useEffect(() => {
    let isMounted = true;
    const getStory = async() => {
      const story = await trigger()
      setTargetStory(story as PostType)
    }
    isMounted && getStory()

    return () => {
      isMounted = false
    }
  }, [trigger, storyId])

  let averageReadingTime = useWordCount(targetStory?.body as string)
  const watchWords = TextRules.keywords as string

  const end = averageReadingTime.split(' ')[1]
  averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end;

  useEffect(() => {
    //console.log(titleFocus)
   setTitleFocus(false)
  }, [])

  const followOrUnfollow = async() => {
    try{
      mutate(
        user_endPoint, 
        followUnfollowUser(targetStory?.userId as string), 
        followUnfollowUserOption(user as UserProps, targetStory?.userId as string)
      )
      toast.success('Success!!', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
    }
    catch(error){
      let errorMessage: string
      const errors = error as ErrorResponse
      errors?.response.status == 400 ? errorMessage = 'bad input' 
      : errors?.response.status == 404 ? errorMessage = 'user not found' 
      : errors?.response?.status == 423 ? errorMessage = 'Account locked' 
      : errors?.response?.status == 409 ? errorMessage = 'You cannot follow yourself'
      : errorMessage = 'internal server error' 

      toast.error(errorMessage, {
        duration: 2000, icon: '💀', style: { background: '##8FBC8F'}
      })
    }
  }

  const bodyContent = targetStory?.body ? targetStory?.body.split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-600 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'text-red-600 bg-gray-600 rounded-sm' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  return (
    <WindowScroll>
      <main className='single_page box-border max-w-full flex-auto flex flex-col gap-4 drop-shadow-2xl'>
        <div className="flex h-full">
          <Aside 
            posts={posts as PostType[]} sidebar={sidebar} 
            setSidebar={setSidebar}
          />
          <ArticleComp 
            post={targetStory as PostType} 
            bodyContent={bodyContent as JSX.Element[]}
            averageReadingTime={averageReadingTime} 
            sidebar={sidebar} isLoading={isMutating} 
            error={error} user={user as UserProps} 
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
