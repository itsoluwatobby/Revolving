import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

const bell_class= "text-xl cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.95] duration-200 ease-in-out text-gray-500";

const arrow_class= "text-base text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

const select_styles = 'border border-t-0 border-l-0 border-r-0 border-b-1 cursor-pointer p-1 hover:pb-2 hover:bg-slate-300 hover:opacity-60 duration-200 ease-in-out rounded-md';

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
  const {search, setSearch, addPost} = usePostContext() as PostContextType
  const currentMode = localStorage.getItem('theme');
  const {theme, canPost, fontFamily, changeTheme, changeFontFamily, fontOption, setFontOption} = useThemeContext() as ThemeContextType
  const onNotify = () => setDisplay(prev => !prev);

  const add = () => {
    const success = addPost()
    success && navigate('/')
  }
  return(
    <nav className={`${pathname == '/new_story' ? 'sticky top-0 pr-5 pl-5 md:pr-16 md:pl-16' : ''} p-4 w-full h-16 flex items-center justify-between`}>
      <div className='flex-none flex items-center gap-2 mobile:relative mobile:gap-0'>
        <Link to='/'>
          <img 
            src={WedgeLoad} 
            alt='Logo' className='h-full object-cover rounded-full'
            onClick={() => setFontOption(false)}
          />
        </Link>
      {
        pathname != '/new_story' ?
          <div className={`flex gap-0.5 justify-around items-center rounded-md w-52 h-full ${theme == 'dark' ? 'bg-gray-500' : ''} mobile:translate-y-8`}>  
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
            : 
            <div className='flex gap-2'>
              <p>{'saving...' || 'saved'}</p>
              <p className='text-gray-500'>Draft</p>
            </div>
          }
      </div>
      <div className='flex-auto mobile:hidden'></div>
      <div className='mobile:-translate-x-[80px] midmobile:-translate-x-24 flex-none flex items-center justify-between w-44 sm:w-52 z-50'>
        {
          theme == 'dark' ? 
            <BsMoonStarsFill 
              onClick={() => changeTheme('light')}
              className={mode_class} /> : <BsMoonStars 
              onClick={() => changeTheme('dark')}
                className={mode_class+'text-gray-700'} />
        }
          {pathname == '/new_story' ? 
            <button
              className={`text-[13px] rounded-2xl p-0.5 shadow-lg active:scale-[0.98] duration-200 ease-in-out pl-1.5 pr-1.5 ${canPost ? 'bg-green-400 hover:text-gray-500  hover:scale-[1.02]' : 'bg-gray-400'}`}
              onClick={add}
              // disabled = {!canPost}
              >Publish</button>
          :
            <Link to={pathname == '/new_story' ? '' : 'new_story'} >
              <div className='flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-gray-700 duration-200 ease-linear font-normal ml-2'>
                <FiEdit className='text-xl' />
                <span className=''>Post</span>
              </div>
            </Link>
          }
        {
          pathname == '/new_story' ? 
          <IoIosMore title='Change font'
            onClick={() => setFontOption(prev => !prev)}
            className='relative cursor-pointer text-xl hover:text-gray-500 duration-200 ease-in' /> 
            : (
                display ? <BsBell 
                    onClick={onNotify}
                  className={bell_class}/> 
                  : <BsBellFill 
                      onClick={onNotify}
                      className={bell_class + 'cursor-pointer'}/>
                )
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
        {pathname != '/new_story' ? <IoIosArrowDown className={`sm:-ml-6 -ml-4 font-thin ${arrow_class}`} /> : null}
      </div>
      <ul className={`${currentMode == 'dark' ? 'text-black font-medium' : ''} absolute shadow-lg right-6 p-2 top-12 bg-slate-500 border rounded-md ${fontOption ? '' : '-translate-y-96'} duration-300 ease-in-out`}>
          {pathname == '/new_story' && (
            Object.entries(custom_fonts).map(([key, options]) => (
              
              <li
                onClick={() => changeFontFamily(key)}
                className={`${select_styles} ${key === fontFamily ? 'bg-gray-200' : null}`} key={key}>{options as string}</li>
              ))
              )
          }
      </ul>
    </nav>
  )
  // TODO: conditional(saving, add font-family to post object)
}

