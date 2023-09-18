import { useSelector } from 'react-redux';
import { custom_fonts } from '../fonts.js';
import { useEffect, useState } from 'react';
import TopLeft from './navModals/TopLeft.js';
import Drawdown from './navModals/Drawdown.js';
import TopRight from './navModals/TopRight.js';
import MidModal from './navModals/MidModal.js';
import { TypingEvent, UserProps } from '../data.js';
import { usePostContext } from '../hooks/usePostContext';
import { useLocation, useParams } from 'react-router-dom';
import { useThemeContext } from '../hooks/useThemeContext';
import { getCurrentUser } from '../features/auth/userSlice.js';
import { getTabCategory } from '../features/story/navigationSlice.js';
import { PostContextType, PostType, ThemeContextType } from '../posts';
import { useGetStoriesByCategoryQuery } from '../app/api/storyApiSlice.js';

const select_styles = 'border border-t-0 border-l-0 border-r-0 border-gray-300 border-b-1 cursor-pointer p-1.5 transition-all hover:pb-1.5 hover:bg-slate-200 hover:opacity-60 ease-in-out rounded-sm';
export const Navbar = () => {
  const { pathname } = useLocation();
  const currentUser = useSelector(getCurrentUser)
  const getNavigation = useSelector(getTabCategory)
  const { typingEvent } = usePostContext() as PostContextType
  const {theme, rollout, notintersecting, fontFamily, setFontFamily, fontOption} = useThemeContext() as ThemeContextType
  const { storyId } = useParams()
  const {data} = useGetStoriesByCategoryQuery(getNavigation)
  const [targetStory, setTargetStory] = useState<PostType>()
  const [delayedSaving, setDelayedSaving] = useState<TypingEvent>('notTyping')
  const designatedPath =  `/story/${storyId}`
  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  useEffect(() => {
    let isMounted = true
    if(data?.length){
      const target = data.find(str => str?._id === storyId)
      isMounted ? setTargetStory(target as PostType) : null
    }
    else{
      return
    }
    return () => {
      isMounted = false
    }
  }, [data, storyId])

  const changeFontFamily = (font: string) => {
    setFontFamily(targetStory?.fontFamily || font)
    localStorage.setItem('fontFamily', font);
  }

  useEffect(() => {
    const responseId = setTimeout(() => {
      setDelayedSaving(typingEvent)
    }, 300)
    return () => clearTimeout(responseId)
  }, [typingEvent])

  return(
    <nav 
      className={`${address.includes(pathname) ? `sticky top-0 pr-2 pl-4 md:pl-16 md:pr-16 ${theme == 'light' ? '' : 'bg-inherit'}` : ''} z-30 p-4 w-full h-16 flex items-center justify-between mobile:justify-between minmobile:pr-0 minmobile:pl-2
     `}>
      
      <TopLeft delayedSaving={delayedSaving} />

      <MidModal 
        targetStory={targetStory as PostType}
        theme={theme} designatedPath={designatedPath}
        pathname={pathname} notintersecting={notintersecting}
      />
      {/* {pathname === '/' ? <Drawdown rollout={rollout} /> : ''} */}
      <Drawdown 
        rollout={rollout} storyId={storyId as string} 
        currentUser={currentUser as UserProps}
      />
      
      <div className={`relative mobile:flex-none flex items-center justify-between p-1 z-30 ${pathname !== `/story/${storyId}` ? 'w-fit' : ''} ${pathname === `/edit_story/${storyId}` ? 'mobile:gap-x-2' : 'mobile:gap-x-1 gap-x-2'}`}>
        <TopRight currentUser={currentUser as UserProps} />
      </div>
     { 
      address.slice(0, 2).includes(pathname) ? (
          <ul className={`${theme == 'dark' ? 'text-black font-medium' : ''} absolute shadow-lg right-5 top-12 border z-50 rounded-md p-2 text-sm ${fontOption ? '' : '-translate-y-96'} duration-300 ease-in-out ${pathname == `/story/${storyId}` ? 'bg-slate-900' : 'bg-slate-400'}`}>
            {
              Object.entries(custom_fonts).map(([key, options]) => (
                <li
                  onClick={() => changeFontFamily(key)}
                  className={`${select_styles} ${key === fontFamily ? 'bg-gray-200' : null}`} key={key}>
                    {options as string}
                </li>
                )
              )
            
            }
          </ul>
        ): null
      }
      {/* <Drawdown rollout={rollout} /> */}
    </nav>
  )
}
