import { useThemeContext } from "../hooks/useThemeContext";
import { PostType, ThemeContextType } from "../posts";
import { useEffect, useState } from 'react';
import { FaTwitterSquare, FaGithub } from 'react-icons/fa';
import { MdAttachEmail } from 'react-icons/md'
import { ErrorStyle, reduceLength } from "../utils/navigator";
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ErrorResponse, SharedProps, UserProps } from "../data";
import { useGetCurrentUserMutation } from "../app/api/usersApiSlice";
import { toast } from "react-hot-toast";
import { useGetUserStoriesQuery } from "../app/api/storyApiSlice";
import { useGetSharedStoriesByUserQuery } from "../app/api/sharedStorySlice";
import { Shared } from "react-redux";


export default function ProfilePage() {
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const { userId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState<boolean>(false)
  const [getCurrentUser] = useGetCurrentUserMutation()
  const { data, isLoading: isStoryLoading, isError: isStoryError, error: storyError } =  useGetUserStoriesQuery(userId as string)
  const { data: sharedData, isLoading: isSharedLoading, isError: isSharedError, error: sharedError } =  useGetSharedStoriesByUserQuery(userId as string)
  const [userProfile, setUserProfile] = useState<UserProps>()
  const [userStories, setUserStories] = useState<Partial<PostType[]>>()

  const about = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus animi sequi quis aut deserunt recusandae! Molestias assumenda incidunt vel amet magnam repudiandae atque dignissimos, ipsam mollitia quidem sint. Delectus, hic? Quibusdam velit facere odit quidem praesentium quo, quis laboriosam quod numquam tenetur quaerat, sapiente sit. Iste architecto voluptatem minima natus eaque libero recusandae aliquam, inventore, molestias explicabo consequuntur atque delectus!'

  useEffect(() => {
    let isMounted = true
    const getUserProfile = async() => {
      try{
        const user = await getCurrentUser(userId as string).unwrap()
        setUserProfile(user)
      }
      catch(err){
        const errors = (err as ErrorResponse) ?? (err as ErrorResponse)
        errors?.originalStatus == 401 && setLoginPrompt('Open')
        err && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
        // state !== '/signIn' ? navigate(state) :  navigate('/')
      }
    }
    if(isMounted && userId && !userProfile) getUserProfile()

    return () => {
      isMounted = false
    }
  }, [userId, setLoginPrompt, getCurrentUser, userProfile])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && userProfile && !userStories?.length){
      const shared = sharedData?.map(shared => {
        return {...shared?.sharedStory, sharedAuthor: shared?.sharedAuthor, sharedDate: shared?.createdAt,  sharedLikes: shared?. sharedLikes }
      }) as PostType[]
      const stories = data as PostType[]
      const allUserStories = [...stories, shared]
      setUserStories(allUserStories as PostType[])
    }

    return () => {
      isMounted = false
    }
  },  [userProfile, data, sharedData, userStories])

  // const truncate = about.length > 250 ? about.substring(0, 250)+'...' : about

  // useEffect(() => {
  //   const userLink = async() => {
  //     const info = await axios.get('https://twitter.com/itsoluwatobby',
  //       {
  //         headers: { 'Content-Type': 'application/json'}
  //       }
  //     )
  //     console.log(info.data)
  //   }
  //   userLink()

  // }, [])
console.log(userProfile)
  return (
    <main role="User profile" className={`hidebars single_page mt-1.5 text-sm p-2 flex md:flex-row flex-col gap-2 w-full overflow-y-scroll`}>

      <div className="md:flex-none h-1/5 shadow-inner shadow-slate-800 rounded-md border md:h-2/3 md:w-1/2 md:sticky md:top-0">
        <figure role="Cover photo" className="relative bg-slate-600 h-full rounded-md shadow-transparent shadow-2xl border-1">
          cover photo
          
          <figure role="Display picture" className="absolute rounded-full border-2 shadow-inner shadow-slate-600 border-gray-300 w-28 lg:w-36 lg:h-36 h-28 translate-x-1/2 top-20 bg-slate-700 right-1/2">
            
          </figure>
        </figure>
      </div>
      <button className={`absolute right-2 top-52 mobile:top-60 lg:top-48 p-1 px-3 rounded-sm shadow-md hover:opacity-90 active:opacity-100 focus:outline-none border-none ${theme === 'light' ? 'bg-slate-400' : 'bg-slate-600'} z-20 transition-all`}
      >
        Edit profile
      </button>
      <div className={`relative hidden maxscreen:block w-full translate-y-20 border ${theme == 'light' ? 'border-t-gray-200' : 'border-t-gray-400'}`}>
        <p role="Code name" className="absolute maxscreen:-top-6 flex items-center gap-2">
          <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Username:</span>
          <span className="font-medium cursor-pointer">{reduceLength(userProfile?.username as string, 15, 'letter')}</span>  
        </p>
        <p role="Country" className={`absolute right-0 maxscreen:-top-6 ${userProfile?.country ? 'flex' : 'flex'} items-center gap-2`}>
          <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Country:</span>
          <span className="font-medium capitalize cursor-pointer">{userProfile?.country}</span>  
        </p>
      </div>

      <section role="user information" className="relative flex py-2 pt-3 md:mt-0 mt-16 flex-col w-full">

        <article className="flex items-center justify-between w-full md:flex-wrap lg:flex-nowrap">

          <div className="flex flex-col gap-1 w-full flex-auto">
            <div className={`${userProfile?.firstName ? 'flex' : 'flex'} items-center gap-1.5 mb-2`}>
              <p className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Name:</p>
              <p className="font-medium capitalize cursor-pointer whitespace-pre-wrap tracking-wide">
                {reduceLength(userProfile?.firstName as string, 20, 'letter')}
                {reduceLength(userProfile?.lastName as string, 20, 'letter')}
              </p>
            </div>
            
            <a 
              href="mailto:email" target='_blank'
              className={`flex items-center gap-1.5 text-blue-600 hover:underline`}
            >
              <MdAttachEmail className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
              itsoluwatobby@gmail.com
            </a>
            <a 
              href="https://github.com/itsoluwatobby" target='_blank'
              className={`absolute flex items-center gap-1.5 right-1 md:left-0 lg:right-1 top-24 text-blue-600 hover:underline`}
            >
              <FaGithub className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
              github.com/itsoluwatobby
            </a>
            <a 
              href="https://twitter.com/itsoluwatobby" target='_blank'
              className={`flex items-center gap-1.5 text-blue-500 hover:underline`}
            >
              <FaTwitterSquare className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
              twitter.com/itsoluwatobby
            </a>
          </div>

          <div className={`flex-none w-[20%] md:translate-x-5 lg:translate-x-0 md:mt-8 lg:mt-0 ${userProfile?.stack?.length ? 'flex' : 'flex'}  items-center flex-col h-20`}>
            <p className={`uppercase text-center ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'} font-semibold font-mono`}>Skills</p>
            <div className="stackflow overflow-y-scroll h-12 p-1 pt-1.5 px-2 w-fit overflow-x-scroll max-w-[120px] last:border-b-0 text-sm text-white whitespace-nowrap font-serif font-light bg-slate-900 rounded-md">
              {
                [...Array(8).keys()]?.map(i => (
                  <p 
                    key={i}
                    className="rounded-md hover:opacity-80 tracking-wide capitalize transition-all cursor-grab">
                      Javascript
                  </p>
                ))
              }
            </div>

          </div>

        </article>

        <div className="flex flex-col mt-2 lg:mt-8 w-full">
          <p className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'} underline underline-offset-2`}>
            About: 
          </p>
          <p 
            onDoubleClick={() => setShowAll(prev => !prev)}
            className="text-justify cursor-pointer w-full whitespace-pre-wrap tracking-wide first-letter:text-lg transition-all">
            {showAll ? about : reduceLength(about, 50, 'word')}
          </p>
        </div>
{/* 
        <div className="absolute h-full w-68 bg-white bottom-0 rounded-lg">
          <iframe 
            title="output"
            src="https://www.google.com"
            sandbox="allow-scripts"
            allow-origin="*"
            frameBorder={0}
            width='100%'
            height='100%'
            className="rounded-lg"
          />
        </div>  */}
      </section>

      <section>
        <hr className={`w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-600'}`}/>
        {/* USER STORIES */}

      </section>
    </main>
  )
}