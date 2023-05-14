import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiEdit } from 'react-icons/fi'
import { BsBell, BsBellFill, BsMoonStars, BsMoonStarsFill } from 'react-icons/bs'
import { CiSearch } from 'react-icons/ci'
import { IoIosArrowDown, IoIosMore } from 'react-icons/io'
import WedgeLoad from '../assets/Wedges-14.3s-44px.svg'
import { usePostContext } from '../hooks/usePostContext'
import { PostContextType, PostType, ThemeContextType } from '../posts'
import { useThemeContext } from '../hooks/useThemeContext'
import profileImage from "../images/bg_image3.jpg"
import { custom_fonts } from '../fonts.js'
import { delayedPromise } from '../hooks/useDebounceHook.js';
// import headings from '../assets/headings.js'

const headings = [
  'We rise and never fall',
  'Doing hard things isn\'t an easy task to accomplish',
  'It will only get better',
  'In all you do, always believe in yourself',
  'It will only get better',
  'Life is never easy, you just have to find a way to live',
  'Always try to wear a smile',
  'You matter and you will always do'
]

const postOptions = ['home', 'save as pdf', 'edit', 'delete', 'logout']

const bell_class= "text-xl cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.95] duration-200 ease-in-out text-gray-500";

const arrow_class= "text-base text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

const select_styles = 'border border-t-0 border-l-0 border-r-0 border-gray-300 border-b-1 cursor-pointer p-1 hover:pb-1.5 hover:bg-slate-400 hover:opacity-60 duration-200 ease-in-out rounded-md';

const option_styles = 'border border-t-0 border-l-0 border-r-0 border-gray-300 border-b-1 cursor-pointer p-1 hover:pb-1.5 hover:bg-slate-400 hover:opacity-60 duration-200 ease-in-out rounded-md';

const mode_class= "text-lg cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

// const button_class= "text-[13px] rounded-2xl p-0.5 shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out pl-1.5 pr-1.5"

// const TIMEOUT = 3500
export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate()
  const [display, setDisplay] = useState<boolean>(false);
  // const [fontOption, setFontOption] = useState<boolean>(false);
  const [image, setImage] = useState<boolean>(false);
  const [spec, setSpec] = useState<number>(1);
  const {postData, search, setSearch, addPost, posts, updatedPost, typingEvent, canPost} = usePostContext() as PostContextType
  const currentMode = localStorage.getItem('theme');
  const {theme, fontFamily, changeTheme, changeFontFamily, fontOption, setFontOption} = useThemeContext() as ThemeContextType
  const { postId } = useParams()
  const [delayedSaving, setDelayedSaving] = useState(false)
  
  const address = ['/new_story', `/edit_story/${postId}`, `/story/${postId}`]
  const fontAddress = ['/new_story', `/edit_story/${postId}`]

  const targetPost = posts?.find(pos => pos?.postId == postId)
  //const onNotify = () => setDisplay(prev => !prev);

  useEffect(() => {
    changeFontFamily(targetPost?.fontFamily as string)
  }, [targetPost, changeFontFamily])

  const add = () => {
    addPost()
    localStorage.removeItem('newStoryInputValue')
    localStorage.removeItem('newStoryTextareaValue')
    navigate('/')
  }

  const update = () => {
    updatedPost()
    localStorage.removeItem('editStoryInputValue')
    localStorage.removeItem('editStoryTextareaValue')
    navigate('/')
  }

  useEffect(() => {
    const responseTime = setTimeout(() => {
      setDelayedSaving(typingEvent)
    }, 1000)
    return () => clearTimeout(responseTime)
  }, [typingEvent])

  return(
    <nav className={`${address.includes(pathname) ? 'sticky top-0 pr-0 pl-5 md:ml-16 mr-16' : ''} p-4 w-full h-16 flex items-center mobile:justify-between mobile:relative
     `}>
      {/* <div className='flex items-center gap-2 mobile:gap-0 border'> */}
        <Link to='/'>
          <img 
            src={WedgeLoad} 
            alt='Logo' className='h-full object-cover rounded-full mr-2'
            onClick={() => setFontOption(false)}
          />
        </Link>
      {
        !address.includes(pathname) ?
          <div className={`flex gap-0.5 justify-around items-center rounded-md w-60 mobile:w-64 h-full ${theme == 'dark' ? 'bg-gray-500' : ''} mobile:translate-y-8`}>  
              <CiSearch className='text-gray-700 text-xl w-8'/>
              <input 
                type="text"
                name='search'
                placeholder='Search Medium'
                value = {search}
                onChange={e => setSearch(e.target.value)}
                className={`placeholder:text-sm w-full rounded-md placeholder:font-normal font-sans flex-auto focus:outline-none h-full p-1 bg-inherit box-border ${theme == 'dark' ? 'placeholder:text-gray-200' : ''}`}
                />
            </div>
            : (
                (postData?.title || postData?.body) && (
                  <div className='flex gap-2 mobile:ml-2'>
                    <p>{delayedSaving ? 'saving...' : 'saved'}</p>
                    <p className='text-gray-500'>Draft</p>
                  </div>
                )
              )
          }
      {/* </div> */}
      <div className='flex-auto mobile:hidden'></div>
      <div className={`mobile:flex-none flex items-center justify-between p-1 z-50 mobile:w-40 ${pathname != `/story/${postId}` ? 'w-44' : 'w-32'}`}>
        {
          theme == 'dark' ? 
            <BsMoonStarsFill 
              onClick={() => changeTheme('light')}
              className={mode_class} /> : <BsMoonStars 
              onClick={() => changeTheme('dark')}
                className={mode_class+'text-gray-700'} />
        }
          {address.includes(pathname) ? 
            (pathname == '/new_story' ?
              <button
                className={`text-[13px] rounded-2xl p-0.5 shadow-lg active:scale-[0.98] duration-200 ease-in-out pl-1.5 pr-1.5 ${canPost ? 'bg-green-400 hover:text-gray-500  hover:scale-[1.02]' : 'bg-gray-400'}`}
                onClick={add}
                disabled = {!canPost}
                >Publish
              </button>
              :
              (pathname != `/story/${postId}` &&
                <button
                  className={`text-[13px] rounded-2xl p-0.5 shadow-lg active:scale-[0.98] duration-200 ease-in-out pl-1.5 pr-1.5 ${canPost ? 'bg-green-400 hover:text-gray-500  hover:scale-[1.02]' : 'bg-gray-400'}`}
                  onClick={update}
                  // disabled = {!canPost}
                  >Republish
                </button>
              )
            )
          :
            <Link to={address.includes(pathname) ? '' : 'new_story'} >
              <div className='flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-gray-700 duration-200 ease-linear font-normal ml-2'>
                <FiEdit className='text-xl' />
                <span className=''>Post</span>
              </div>
            </Link>
          }
        {
          address.includes(pathname) && 
          <IoIosMore title='Change font'
            onClick={() => setFontOption(prev => !prev)}
            className='relative cursor-pointer text-xl hover:text-gray-500 duration-200 ease-in' /> 
            // : (
            //     display ? <BsBell 
            //         onClick={onNotify}
            //       className={bell_class}/> 
            //       : <BsBellFill 
            //           onClick={onNotify}
            //           className={bell_class + 'cursor-pointer'}/>
            //     )
        }
        <div className='w-12 p-1 flex'>
          {image ?
              <div className='cursor-pointer w-8 h-8 bg-slate-500 rounded-full border-2 border-slate-600'></div>
              :
            <div className='w-8 h-8 bg-slate-800 rounded-full border-2 border-gray-300 cursor-pointer'>
              <img src={profileImage} alt="dp" className='object-cover h-full w-full rounded-full'/>
            </div>
          }
        </div>
        {!address.includes(pathname) ? <IoIosArrowDown className={`sm:-ml-6 -ml-4 font-thin ${arrow_class}`} /> : null}
      </div>
      <ul className={`${currentMode == 'dark' ? 'text-black font-medium' : ''} absolute shadow-lg right-6 top-12 border z-50 rounded-md ${fontOption ? '' : '-translate-y-96'} duration-300 ease-in-out ${pathname == `/story/${postId}` ? 'bg-slate-900 p-1' : 'bg-slate-400'}`}>
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
    </nav>
  )
  // TODO: conditional(saving, add font-family to post object)
}

