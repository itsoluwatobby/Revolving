import { BsMoonStars } from "react-icons/bs"
import { FiSun } from "react-icons/fi"
import { useThemeContext } from "../../hooks/useThemeContext"
import { PostContextType, PostType, ThemeContextType } from "../../posts"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { FiEdit } from 'react-icons/fi'
import { IoIosArrowDown, IoIosMore } from 'react-icons/io'
import profileImage from "../../images/bg_image3.jpg"
import { usePostContext } from "../../hooks/usePostContext"
import { useState } from "react"
import { toast } from "react-hot-toast";
import { sub } from "date-fns"
import { ErrorResponse } from "../../data"
import { useCreateStoryMutation, useUpdateStoryMutation } from "../../app/api/storyApiSlice"

const arrow_class= "text-base text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

const mode_class= "text-lg cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

export default function TopRight() {
  const [updateStory, {
    isLoading: updateLoading, 
    error: updateError, isError: isUpdateError 
  }] = useUpdateStoryMutation()
  const [createStory, { 
    isLoading: createLoading, 
    error: createError, isError: isCreateError 
  }] = useCreateStoryMutation()
  const { 
    theme, setRollout, changeTheme, 
    setFontOption 
  } = useThemeContext() as ThemeContextType

  const {postData, canPost} = usePostContext() as PostContextType
  const [image, setImage] = useState<boolean>(false);
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { storyId } = useParams()

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  const addPost = async() => {
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    const newStory = { storyDate: dateTime, ...postData } as PostType
    try{
        await createStory({ userId: newStory?.userId, story: newStory }).unwrap()
        localStorage.removeItem(`newTitle?id=${newStory?.userId}`)
        localStorage.removeItem(`newBody?id=${newStory?.userId}`)
        
        toast.success('Success!! Post added',{
            duration: 2000, icon: '🔥', 
            style: { background: '#3CB371' }
          }
        )  
        navigate('/')
    }
    catch(err: unknown){
      const errors = createError as ErrorResponse
      isCreateError && toast.error(`${errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const updatedPost = async() => {
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    const postUpdated = {...postData, _id: storyId, editDate: dateTime} as PostType;
    try{
      await updateStory({ userId: postUpdated?.userId, story: postUpdated }).unwrap()
      localStorage.removeItem(`editTitle?id=${postUpdated?.userId}`)
      localStorage.removeItem(`editBody?id=${postUpdated?.userId}`)
      
      toast.success('Success!! Post Updated',{
          duration: 2000, icon: '🔥', 
          style: { background: '#3CB371' }
        }
      )  
      navigate('/')
    }
    catch(err: unknown){
      const errors = updateError as ErrorResponse
      isUpdateError && toast.error(`${errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  return (
    <>
      {
          theme == 'dark' ? 
            <FiSun 
              onClick={() => changeTheme('light')}
              className={mode_class} /> : <BsMoonStars 
              onClick={() => changeTheme('dark')}
                className={mode_class+'text-gray-700'} />
        }
          {address.includes(pathname) ? 
            (
              pathname == '/new_story' ?
              <button
                className={`text-[13px] rounded-2xl p-0.5 shadow-lg active:scale-[0.98] duration-200 ease-in-out pl-1.5 pr-1.5 ${canPost ? 'bg-green-400 hover:text-gray-500  hover:scale-[1.02]' : 'bg-gray-400'}`}
                onClick={addPost}
                disabled = {!canPost}
                >Publish
              </button>
              :
              (
                pathname != `/story/${storyId}` &&
                  <button
                    className={`text-[13px] rounded-2xl p-0.5 shadow-lg active:scale-[0.98] duration-200 ease-in-out pl-1.5 pr-1.5 ${canPost ? 'bg-green-400 hover:text-gray-500  hover:scale-[1.02]' : 'bg-gray-400'}`}
                      onClick={updatedPost}
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