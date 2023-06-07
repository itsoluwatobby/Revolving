import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import { usePostContext } from '../hooks/usePostContext'
import { PostContextType, ThemeContextType } from '../posts'
import { useThemeContext } from '../hooks/useThemeContext'
import { custom_fonts } from '../fonts.js'
import Drawdown from './navModals/Drawdown.js';
import TopRight from './navModals/TopRight.js';
import TopLeft from './navModals/TopLeft.js';

const postOptions = ['home', 'pdf', 'edit', 'delete', 'logout']

const select_styles = 'border border-t-0 border-l-0 border-r-0 border-gray-300 border-b-1 cursor-pointer p-1 hover:pb-1.5 hover:bg-slate-200 hover:opacity-60 duration-200 ease-in-out rounded-md';

const option_styles = 'bg-slate-400 cursor-pointer p-1 hover:pb-1.5 uppercase text-center text-xs hover:bg-slate-400 hover:opacity-60 duration-200 ease-in-out rounded-sm';

// const TIMEOUT = 3500
export const Navbar = () => {
  const { pathname } = useLocation();
  const {posts, typingEvent} = usePostContext() as PostContextType
  const {theme, rollout, fontFamily, setFontFamily, fontOption} = useThemeContext() as ThemeContextType
  const { storyId } = useParams()
  const [delayedSaving, setDelayedSaving] = useState(false)
  const [options, setOptions] = useState<string>('')
  
  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  const targetPost = posts?.find(story => story?._id == storyId)

  const changeFontFamily = (font: string) => {
    setFontFamily(targetPost?.fontFamily || font)
    localStorage.setItem('fontFamily', font);
  }

  useEffect(() => {
    const responseTime = setTimeout(() => {
      setDelayedSaving(typingEvent)
    }, 1000)
    return () => clearTimeout(responseTime)
  }, [typingEvent])
//console.log({fontFamily})
  return(
    <nav 
      className={`${address.includes(pathname) ? `sticky top-0 pr-2 pl-4 md:pl-16 md:pr-16 z-50 ${theme == 'light' ? '' : 'bg-inherit'}` : ''} p-4 w-full h-16 flex items-center mobile:justify-between mobile:relative
     `}>
      
      <TopLeft delayedSaving={delayedSaving} />

      <div className='flex-auto mobile:hidden'></div>

      <div className={`relative mobile:flex-none flex items-center justify-between p-1 z-50 mobile:w-40 ${pathname != `/story/${storyId}` ? 'w-44' : 'w-32'}`}>
        <TopRight />
      </div>
     { 
      address.slice(0, 2).includes(pathname) ? (
          <ul className={`${theme == 'dark' ? 'text-black font-medium' : ''} absolute shadow-lg right-6 top-12 border z-50 rounded-md ${fontOption ? '' : '-translate-y-96'} duration-300 ease-in-out ${pathname == `/story/${storyId}` ? 'bg-slate-900 p-1' : 'bg-slate-400'}`}>
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

