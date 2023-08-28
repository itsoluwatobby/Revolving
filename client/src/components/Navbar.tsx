import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import { usePostContext } from '../hooks/usePostContext'
import { PostContextType, PostType, ThemeContextType } from '../posts'
import { useThemeContext } from '../hooks/useThemeContext'
import { custom_fonts } from '../fonts.js'
import Drawdown from './navModals/Drawdown.js';
import TopRight from './navModals/TopRight.js';
import TopLeft from './navModals/TopLeft.js';
import { useGetStoriesByCategoryQuery } from '../app/api/storyApiSlice.js';
import { useSelector } from 'react-redux';
import { getTabCategory } from '../features/story/navigationSlice.js';
import MidModal from './navModals/MidModal.js';
import { TypingEvent } from '../data.js';

const postOptions = ['home', 'pdf', 'edit', 'delete', 'logout']

const select_styles = 'border border-t-0 border-l-0 border-r-0 border-gray-300 border-b-1 cursor-pointer p-0.5 transition-all hover:pb-1.5 hover:bg-slate-200 hover:opacity-60 duration-200 ease-in-out rounded-md';

const option_styles = 'bg-slate-400 cursor-pointer p-1 hover:pb-1.5 uppercase text-center text-xs hover:bg-slate-400 hover:opacity-60 duration-200 ease-in-out rounded-sm';

export const Navbar = () => {
  const { pathname } = useLocation();
  const getNavigation = useSelector(getTabCategory)
  const { typingEvent } = usePostContext() as PostContextType
  const {theme, rollout, notintersecting, fontFamily, setFontFamily, fontOption} = useThemeContext() as ThemeContextType
  const { storyId } = useParams()
  const {data} = useGetStoriesByCategoryQuery(getNavigation)
  const [targetStory, setTargetStory] = useState<PostType>()
  const [delayedSaving, setDelayedSaving] = useState<TypingEvent>('notTyping')
  const [options, setOptions] = useState<string>('')
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
      className={`${address.includes(pathname) ? `sticky top-0 pr-2 pl-4 md:pl-16 md:pr-16 ${theme == 'light' ? '' : 'bg-inherit'}` : ''} z-50 p-4 w-full h-16 flex items-center mobile:justify-between mobile:relative mobile:pr-1 minmobile:pr-0 minmobile:pl-2
     `}>
      
      <TopLeft delayedSaving={delayedSaving} />

      <MidModal 
        targetStory={targetStory as PostType}
        theme={theme}
        designatedPath={designatedPath}
        pathname={pathname}
        notintersecting={notintersecting}
      />

      <div className={`relative mobile:flex-none flex items-center sm:gap-1 justify-between p-1 z-50 ${pathname != `/story/${storyId}` ? 'w-44 mobile:w-36' : 'mobile:w-28 mobile:pr-0 w-[120px] minmobile:w-20'}`}>
        <TopRight />
      </div>
     { 
      address.slice(0, 2).includes(pathname) ? (
          <ul className={`${theme == 'dark' ? 'text-black font-medium' : ''} absolute shadow-lg right-6 top-12 border z-50 rounded-md p-1 text-sm ${fontOption ? '' : '-translate-y-96'} duration-300 ease-in-out ${pathname == `/story/${storyId}` ? 'bg-slate-900' : 'bg-slate-400'}`}>
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
        ) : 
        <ButtonFunc 
            pathname={pathname} setOptions={setOptions}
            storyId={storyId} theme={theme} fontOption={fontOption}
            options={options}
        />  
      }
      <Drawdown rollout={rollout} />
    </nav>
  )
}

type ButtonFuncProps = {
  pathname: string,
  storyId?: string,
  theme: string,
  options: string,
  fontOption: boolean,
  setOptions: React.Dispatch<React.SetStateAction<string>>
}

const ButtonFunc = ({ pathname, setOptions, storyId, theme, fontOption, options } : ButtonFuncProps) => {

  return (
    <ul className={`${theme == 'dark' ? 'text-black font-medium' : ''} absolute shadow-lg right-6 top-12 border z-50 rounded-md ${fontOption ? '' : '-translate-y-96'} duration-300 ease-in-out ${pathname == `/story/${storyId}` ? 'bg-slate-900 p-1' : 'bg-slate-400'}`}>
        {
          pathname == `/story/${storyId}` && (
            postOptions.map(option => (
                <li title={`${option == 'pdf' ? 'save as pdf' : option}`}
                  onClick={() => setOptions(option)}
                  className={`${option_styles} ${option == options ? 'bg-slate-500' : null}`} key={option}
                  >
                  {option}
                </li>
              )
            )
          )
        }
    </ul>
  )
}

