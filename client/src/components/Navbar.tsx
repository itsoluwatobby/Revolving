import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import { usePostContext } from '../hooks/usePostContext'
import { PostContextType, ThemeContextType } from '../posts'
import { useThemeContext } from '../hooks/useThemeContext'
import { custom_fonts } from '../fonts.js'
import Drawdown from './navModals/Drawdown.js';
import TopRight from './navModals/TopRight.js';
import TopLeft from './navModals/TopLeft.js';

const postOptions = ['home', 'save as pdf', 'edit', 'delete', 'logout']

const select_styles = 'border border-t-0 border-l-0 border-r-0 border-gray-300 border-b-1 cursor-pointer p-1 hover:pb-1.5 hover:bg-slate-400 hover:opacity-60 duration-200 ease-in-out rounded-md';

const option_styles = 'border border-t-0 border-l-0 border-r-0 border-gray-300 border-b-1 cursor-pointer p-1 hover:pb-1.5 hover:bg-slate-400 hover:opacity-60 duration-200 ease-in-out rounded-md';

// const TIMEOUT = 3500
export const Navbar = () => {
  const { pathname } = useLocation();
  const {posts, typingEvent} = usePostContext() as PostContextType
  const {theme, rollout, fontFamily, changeFontFamily, fontOption} = useThemeContext() as ThemeContextType
  const { postId } = useParams()
  const [delayedSaving, setDelayedSaving] = useState(false)
  
  const address = ['/new_story', `/edit_story/${postId}`, `/story/${postId}`]

  const targetPost = posts?.find(pos => pos?._id == postId)

  useEffect(() => {
    changeFontFamily(targetPost?.fontFamily as string)
  }, [targetPost, changeFontFamily])

  useEffect(() => {
    const responseTime = setTimeout(() => {
      setDelayedSaving(typingEvent)
    }, 1000)
    return () => clearTimeout(responseTime)
  }, [typingEvent])

  return(
    <nav className={`${address.includes(pathname) ? 'sticky top-0 pr-0 pl-5 md:pl-16 md:pr-16' : ''} p-4 w-full h-16 flex items-center mobile:justify-between mobile:relative
     `}>
      
      <TopLeft delayedSaving={delayedSaving} />

      <div className='flex-auto mobile:hidden'></div>

      <div className={`relative mobile:flex-none flex items-center justify-between p-1 z-50 mobile:w-40 ${pathname != `/story/${postId}` ? 'w-44' : 'w-32'}`}>
        <TopRight />
      </div>
      <ul className={`${theme == 'dark' ? 'text-black font-medium' : ''} absolute shadow-lg right-6 top-12 border z-50 rounded-md ${fontOption ? '' : '-translate-y-96'} duration-300 ease-in-out ${pathname == `/story/${postId}` ? 'bg-slate-900 p-1' : 'bg-slate-400'}`}>
          {
            address.slice(0, 2).includes(pathname) ? (
                Object.entries(custom_fonts).map(([key, options]) => (

                  <li
                    onClick={() => changeFontFamily(key)}
                    className={`${select_styles} ${key === fontFamily ? 'bg-gray-200' : null}`} key={key}>
                      {options as string}
                  </li>
                  )
                )
              ) : 
                pathname == `/story/${postId}` && (
                  postOptions.map((option, i) => (
                    <li
                      // onClick={() => ''}
                      className={`${option_styles} ${option === postOptions[i] ? 'bg-gray-400' : null}`} key={option}
                      >
                        {option}
                      </li>
                  )
                )
              )
          }
      </ul>
      {rollout && <Drawdown />}
    </nav>
  )
}

