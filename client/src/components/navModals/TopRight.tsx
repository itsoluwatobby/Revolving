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
import { useSWRConfig } from 'swr'
import { axiosPrivate, posts_endPoint as cacheKey } from '../../api/axiosPost'
import { addPostOptions, updatePostOptions } from "../../api/postApiOptions"
import { toast } from "react-hot-toast";
import useStoryMutation from "../../hooks/useStoryMutation";
import useAuthenticationContext from "../../hooks/useAuthenticationContext"
import { sub } from "date-fns"
import { AuthenticationContextType } from "../../data"
//import useSWRMutation from 'swr/mutation'

const arrow_class= "text-base text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

const mode_class= "text-lg cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

export default function TopRight() {
  const { mutate } = useSWRConfig()
  const [createPost, updatePost] = useStoryMutation()
  const { theme, setRollout, changeTheme, setFontOption } = useThemeContext() as ThemeContextType
  const {postData, canPost} = usePostContext() as PostContextType
  const { auth } = useAuthenticationContext() as AuthenticationContextType;
  const [image, setImage] = useState<boolean>(false);
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { storyId } = useParams()

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  const addPost = () => {
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    const newPost = { storyDate: dateTime, ...postData } as PostType
    try{
        mutate(cacheKey, async () => await axiosPrivate.post(`${cacheKey}/${auth?._id}`, newPost), addPostOptions(newPost))
        localStorage.removeItem('newStoryInputValue')
        localStorage.removeItem('newStoryTextareaValue')
        toast.promise(createPost(newPost), { 
            loading: 'updating post 🚀', success: 'Success!! Post added', error: 'error occurred' 
          },{
            success:{
              duration: 4000, icon: '🔥'
            },
              style: { background: '#3CB371'}
            }
          )
        navigate('/')
    }
    catch(error){
       toast.error('Failed!! to add new post', {
        duration: 1000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const updatedPost = () => {
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    const postUpdated = {...postData, _id: storyId, editDate: dateTime} as PostType;
    try{
        mutate(cacheKey, async () => await axiosPrivate.put(`${cacheKey}/${auth?._id}/${postUpdated?._id}`, {...postUpdated}), updatePostOptions(postUpdated))

        localStorage.removeItem('editStoryInputValue')
        localStorage.removeItem('editStoryTextareaValue')
    
        toast.promise(updatePost(postUpdated), { 
            loading: 'updating post 🚀', success: 'Success!! Post editted', error: 'error occurred' 
          },{
            success:{
              duration: 2000, icon: '🔥'
            },
            style: { background: '#3CB371'}
          }
        )
        navigate('/')
    }
    catch(err){
      toast.error('Failed!! to update post', {
        duration: 1000, icon: '💀', style: {
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