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
import { ErrorResponse } from "../../data"
import { useCreateStoryMutation, useUpdateStoryMutation } from "../../app/api/storyApiSlice"
import { useSelector } from "react-redux"
import { getStoryData } from "../../features/story/storySlice"

const arrow_class= "text-base text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

const mode_class= "text-lg cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

export default function TopRight() {
  const [updateStory, {error: updateError, isError: isUpdateError}] = useUpdateStoryMutation()
  const [createStory, {error: createError, isError: isCreateError}] = useCreateStoryMutation()
  const { theme, setRollout, changeTheme, setFontOption, setLoginPrompt 
  } = useThemeContext() as ThemeContextType
  const { canPost } = usePostContext() as PostContextType
  const storyData = useSelector(getStoryData) 
  const [image, setImage] = useState<boolean>(false);
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { storyId } = useParams()

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  const createNewStory = async() => {
    if(storyData){
      const userId = storyData.userId as string
      const story = storyData as PostType
      try{
          await createStory({ userId, story }).unwrap()
          localStorage.removeItem(`newTitle?id=${userId}`)
          localStorage.removeItem(`newBody?id=${userId}`)
          
          toast.success('Success!! Post added',{
              duration: 2000, icon: '🔥', 
              style: { background: '#3CB371' }
            }
          ) 
          navigate('/')
      }
      catch(err: unknown){
        const errors = createError as ErrorResponse
        errors?.originalStatus == 401 && setLoginPrompt('Open')
        isCreateError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
          duration: 2000, icon: '💀', style: {
            background: '#FF0000'
          }
        })
      }
    }
    return
  }

  const updatedPost = async() => {
    if(storyData){
      const userId = storyData.userId as string
      const story = storyData as PostType
      try{
        await updateStory({ userId, storyId: story?._id, story }).unwrap()
        localStorage.removeItem(`editTitle?id=${userId}`)
        localStorage.removeItem(`editBody?id=${userId}`)
        
        toast.success('Success!! Post Updated',{
            duration: 2000, icon: '🔥', 
            style: { background: '#3CB371' }
          }
        )  
        navigate('/')
      }
      catch(err: unknown){
        const errors = updateError as ErrorResponse
        console.log(errors)
        errors?.originalStatus == 401 && setLoginPrompt('Open')
        isUpdateError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
          duration: 2000, icon: '💀', style: {
            background: '#FF0000'
          }
        })
      }
    }
    return
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
                onClick={createNewStory}
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
            <Link to={'/new_story'} >
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