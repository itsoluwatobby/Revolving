import { BsMoonStars, BsMoonStarsFill } from "react-icons/bs"
import { useThemeContext } from "../../hooks/useThemeContext"
import { PostContextType, ThemeContextType } from "../../posts"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { FiEdit } from 'react-icons/fi'
import { IoIosArrowDown, IoIosMore } from 'react-icons/io'
import profileImage from "../../images/bg_image3.jpg"
import { usePostContext } from "../../hooks/usePostContext"
import { useState } from "react"

const arrow_class= "text-base text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

const mode_class= "text-lg cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

type TopRightProps={
  setRollout: React.Dispatch<React.SetStateAction<boolean>>
}
//
export default function TopRight({ setRollout }: TopRightProps) {
  const { theme, changeTheme, setFontOption } = useThemeContext() as ThemeContextType
  const {addPost, updatedPost, canPost} = usePostContext() as PostContextType
  const [image, setImage] = useState<boolean>(false);
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { postId } = useParams()

  const address = ['/new_story', `/edit_story/${postId}`, `/story/${postId}`]

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

  return (
    <>
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
                    disabled = {!canPost}
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
        {!address.includes(pathname) ? 
                <IoIosArrowDown 
                  onClick={() => setRollout(prev => !prev)}
                  className={`sm:-ml-6 -ml-4 font-thin ${arrow_class}`} /> : null}
    </>
  )
}