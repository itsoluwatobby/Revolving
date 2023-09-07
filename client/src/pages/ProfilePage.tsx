import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";
import { useEffect, useState } from 'react';
import { FaTwitterSquare, FaGithub } from 'react-icons/fa';
import { MdAttachEmail } from 'react-icons/md'
import { ErrorStyle, reduceLength } from "../utils/navigator";
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ErrorResponse, UserProps } from "../data";
import { useGetCurrentUserMutation } from "../app/api/usersApiSlice";
import { toast } from "react-hot-toast";


export default function ProfilePage() {
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const { userId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState<boolean>(false)
  const [getCurrentUser, { isLoading, isError, error }] = useGetCurrentUserMutation()
  const [userProfile, setUserProfile] = useState<UserProps>()

  const about = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus animi sequi quis aut deserunt recusandae! Molestias assumenda incidunt vel amet magnam repudiandae atque dignissimos, ipsam mollitia quidem sint. Delectus, hic? Quibusdam velit facere odit quidem praesentium quo, quis laboriosam quod numquam tenetur quaerat, sapiente sit. Iste architecto voluptatem minima natus eaque libero recusandae aliquam, inventore, molestias explicabo consequuntur atque delectus!'
console.log(state)
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
    <main role="User profile" className={`hidebars single_page mt-1.5 border text-sm p-2 flex md:flex-row flex-col gap-2 w-full overflow-y-scroll`}>

      <div className="md:flex-none h-1/5 shadow-inner shadow-slate-800 rounded-md border md:h-2/3 md:w-1/2 md:sticky md:top-0">
        <figure role="Cover photo" className="relative bg-slate-600 h-full rounded-md shadow-transparent shadow-2xl border-1">
          cover photo
          
          <figure role="Display picture" className="rounded-full border-2 shadow-inner shadow-slate-600 border-gray-300 w-28 lg:w-36 lg:h-36 h-28 absolute translate-x-1/2 top-20 bg-slate-700 right-1/2 mobile:top-64">
            
          </figure>
        </figure>
      </div>

      <div className={`relative hidden maxscreen:block w-full translate-y-20 border ${theme == 'light' ? 'border-t-gray-200' : 'border-t-gray-400'}`}>
        <p role="Code name" className="absolute left-2 maxscreen:-top-6 flex items-center gap-2 mobile:top-[330px]">
          <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-500'}`}>Username:</span>
          <span className="font-medium cursor-pointer">itsoluwatobby</span>  
        </p>
        <p role="Country" className="absolute right-2 maxscreen:-top-6 flex items-center gap-2 mobile:top-[330px]">
          <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-500'}`}>Country:</span>
          <span className="font-medium capitalize cursor-pointer">Nigeria</span>  
        </p>
      </div>

      <section role="user information" className="relative flex p-2 pt-3 mt-16 flex-col w-full">

        <article className="flex items-center justify-between w-full">

          <div className="flex flex-col gap-1 w-full">

            <p className="flex items-center gap-1.5 mb-2">
              <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-500'}`}>Name:</span>
              <span className="font-medium capitalize cursor-pointer">itsoluwatobby</span>
            </p>
            <a 
              href="mailto:email"
              className={`flex items-center gap-1.5 text-blue-600 hover:underline`}
            >
              <MdAttachEmail className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
              itsoluwatobby@gmail.com
            </a>
            <a 
              href="https://github.com/itsoluwatobby"
              className={`absolute flex items-center gap-1.5 right-1 mt-[70px] text-blue-600 hover:underline`}
            >
              <FaGithub className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
              github.com/itsoluwatobby
            </a>
            <a 
              href="https://twitter.com/itsoluwatobby"
              className={`flex items-center gap-1.5 text-blue-500 hover:underline`}
            >
              <FaTwitterSquare className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
              twitter.com/itsoluwatobby
            </a>

          </div>

          <div className="flex flex-col h-20">
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

        <div className="flex flex-col mt-2 w-full">
          <p className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-500'} underline underline-offset-2`}>
            About: 
          </p>
          <p 
            onDoubleClick={() => setShowAll(prev => !prev)}
            className="text-justify cursor-pointer w-full whitespace-pre-wrap tracking-wide first-letter:text-lg">
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
      <div className={`md:hidden w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-600'}`}/>
      {/* USER STORIES */}
    </main>
  )
}