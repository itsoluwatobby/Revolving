import { useSelector } from "react-redux";
import { ThemeContextType } from "../types/posts";
import { reduceLength } from "../utils/navigator";
import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../hooks/useThemeContext";
import { getCurrentUser } from "../features/auth/userSlice";

type RouteProps = {
  name: string,
  link: string
}

const routeLinkNames = ({ userId }:{ userId?: string }): RouteProps[] =>{ 
  
  return ([
      {
        name: 'Home Page',
        link: `/`
      },
      {
        name: 'Profile Page',
        link: `/profile/${userId}`
      },
      {
        name: 'Task Manager',
        link: `/taskManager/${userId}`
      },
      // {
      //   name: 'Expense Planner',
      //   link: `/expensePlanner/${userId}`
      // },
      // {
      //   name: 'Admin Page',
      //   link: `/adminPage/${userId}`
      // },
      {
        name: `About`,
        link: `/about`
      },
      {
        name: 'Logout',
        link: `/signout/${userId}`
      },
    ])
}

export const LeftSection = () => {
  const location = useLocation()
  const storyId = location.pathname.split('/')[2]
  const pathname = location.pathname
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const currentUser = useSelector(getCurrentUser)
  const { theme, toggleLeft, setToggleLeft, setLoginPrompt  } = useThemeContext() as ThemeContextType

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  const conditionalRouting = (value: {name: string}): boolean => {
    return (!currentUserId && (value.name == 'Profile Page' || value.name == 'Task Manager' || value.name == 'Expense Planner' || value.name == 'CV/Resume Builder' || value.name == 'Admin Page'))
  }
// 'maxscreen:translate-x-0 maxscreen:w-[35%]' : 'maxscreen:-translate-x-96 maxscreen:w-0'
  return (
    <section className={`sidebars md:h-[calc(100vh-78px)] sticky top-[72px] flex-non h-full mt-2 ${address.includes(pathname) ? 'hidden' : 'md:block'} lg:max-w-[20%] transition-all overflow-y-scroll ${toggleLeft === 'Open' ? 'midscreen:fixed midscreen:top-0 midscreen:mt-0 midscreen:h-full midscreen:w-full' : 'md:block hidden'} ${theme == 'light' ? 'bg-gray-50 midscreen:bg-opacity-20' : 'bg-slate-700 midscreen:bg-opacity-20'} md:w-[40%] rounded-tr-lg z-50`}>

      <div className={`sidebars h-full p-1 pb-2.5 md:w-ful overflow-y-scroll flex flex-col rounded-tr-md rounded-br-md justify-between midscreen:w-[35%] maxmobile:w-1/2 ${theme == 'light' ? 'midscreen:bg-gray-50' : 'midscreen:bg-slate-700'} transition-all`}>
        
        <div className='flex flex-col w-full gap-1'>
          
          <div className={`relative w-full h-8 flex items-center`}>
            <button
              onClick={() => setToggleLeft('Hide')}
              className={`absolute p-2 text-sm md:hidden pt-1 pb-1 text-center rounded-md right-0 ${theme == 'light' ? 'bg-slate-300' : 'bg-slate-500'}`}
            >
              close
            </button>
          </div>
          <div className={`h-full pt-2 flex flex-col gap-1`}>
            {
              routeLinkNames({ userId: currentUserId })?.map(values => (
                <Link to={conditionalRouting(values) ? '' : values.link}
                  key={values.name}
                  onClick={() => conditionalRouting(values) ? setLoginPrompt({opened: 'Open'}) : null}
                  className={`p-3 lg:py-3 ${!currentUserId && values.name === 'Logout' ? 'hidden' : 'block'} ${values.link === pathname ? 'bg-slate-400 shadow-slate-400 shadow-sm text-white' : ''} cursor-pointer hover:bg-slate-500 hover:rounded-md rounded-md text-center border border-r-0 border-l-0 border-slate-500 border-t-0 border-b-1 transition-all`}
                >
                  {values.name}
                </Link>
              ))
            }
          </div>
        
        </div>
        
        <Link to={`/profile/${currentUser?._id}`} className={`flex-none self-end bottom-2 p-2 cursor-pointer bg-slate-500 w-full ${currentUser?._id ? 'flex' : 'hidden'} transition-all items-center gap-2 rounded-md`}>
          <figure className="rounded-full border-2 shadow-2xl h-10 w-10">
            {
              currentUser?.displayPicture?.photo ?
              <img src={currentUser?.displayPicture?.photo} alt="" loading='eager' className="w-full h-full object-cover rounded-full" /> : null
            }
          </figure>
          <p className="text-white hover:underline">{reduceLength(currentUser?.email as string, 13, 'letter')}</p>
        </Link>

      </div>

    </section>
  )
}

