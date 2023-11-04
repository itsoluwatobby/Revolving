import { sub } from "date-fns";
import { FiSun } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { FiEdit } from 'react-icons/fi';
import { nanoid } from "@reduxjs/toolkit";
import { IoIosMore } from 'react-icons/io';
import { BsMoonStars } from "react-icons/bs";
import { BiMessageDots } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useCallback } from 'react';
import { usePostContext } from "../../hooks/usePostContext";
import { useThemeContext } from "../../hooks/useThemeContext";
import { useGetNotificationQuery } from "../../app/api/noficationSlice";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ErrorStyle, SuccessStyle, checkCount } from "../../utils/navigator";
import { ErrorResponse, NotificationBody, UserProps } from "../../types/data";
import { useCreateStoryMutation, useUpdateStoryMutation } from "../../app/api/storyApiSlice";
import { getStoryData, getUrl, resetUrl, setLoading } from "../../features/story/storySlice";
import { CodeStoreType, PostContextType, PostType, ThemeContextType } from "../../types/posts";


type TopRightProps = {
  currentUser: UserProps
}
export default function TopRight({ currentUser }: TopRightProps) {
  const [updateStory, {isLoading: isLoadingUpdate, error: updateError}] = useUpdateStoryMutation()
  const [createStory, {isLoading: isLoadingCreate, error: createError}] = useCreateStoryMutation()
  const { theme, codeEditor, editing, openNotification, setOpenChat, setRollout, setOpenNotification, setSuccess, setEditing, setTheme, setIsPresent, setFontOption, setLoginPrompt 
  } = useThemeContext() as ThemeContextType
  const { data } = useGetNotificationQuery(currentUser?._id as string)
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationBody[]>([])
  const { canPost, inputValue, setCodeStore, submitToSend, setImagesFiles } = usePostContext() as PostContextType
  const storyData = useSelector(getStoryData)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const url = useSelector(getUrl)
  const { storyId, storyUserId } = useParams()
  const dispatch = useDispatch()
  
  const address = ['/new_story', `/edit_story/${storyId}/${storyUserId}`, `/story/${storyId}`]
  const exclude = ['/signIn', '/signUp', '/new_password', '/otp']
  
  const mode_class = useCallback((type: 'SUN' | 'MOON') => {
    return (
      `text-lg cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out mr-2 ${type === 'SUN' ? '' : 'text-gray-700'}`
    )
  }, []) 
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && data) {
      const unread = data?.notification?.filter(notification => notification?.status === 'unread')
      setUnreadNotifications(unread)
    }
    return () => {
      isMounted = false
    }
  }, [data])

  const createNewStory = async() => {
    if(!storyData.userId) return setLoginPrompt({opened: 'Open'})
    if(storyData){
      const adjustCodes = submitToSend?.map(code => {
        const { codeId, ...rest } = code
        void(codeId)
        return rest
      })
      dispatch(setLoading(true))
      const urls = url.map(ur => ur.url)
      const userId = storyData.userId as string
      const story = {...storyData, picture: [...urls], code: [...adjustCodes]} as PostType
      try{
          await createStory({ userId, story }).unwrap()
          localStorage.removeItem(`newTitle?id=${userId}`)
          localStorage.removeItem(`newBody?id=${userId}`)
          submitToSend.map(lang => {
            localStorage.removeItem(`revolving-${lang?.language}`)
          })
          toast.success('Success!! Story added', SuccessStyle)
          dispatch(resetUrl())
          setImagesFiles([])
          dispatch(setLoading(false))
          navigate('/')
      }
      catch(err: unknown){
        const errors = (createError as ErrorResponse) ?? (err as ErrorResponse)
        errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
        const message = errors?.status === 'FETCH_ERROR' ? 'SERVER ERROR' : (errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message)
        toast.error(`${message}`, ErrorStyle)
      }
      finally{
        dispatch(setLoading(false))
      }
    }
    return
  }

  const updatedPost = async() => {
    if(storyData){
      const adjustCodes = submitToSend?.map(code => {
        const { codeId, ...rest } = code
        void(codeId)
        return rest
      })
      dispatch(setLoading(isLoadingUpdate))
      const userId = storyData.userId as string
      const story = {...storyData, code: [...adjustCodes]} as PostType
      try{
        await updateStory({ userId, storyId: story?._id, story }).unwrap()
        localStorage.removeItem(`editTitle?id=${userId}`)
        localStorage.removeItem(`editBody?id=${userId}`)
        submitToSend.map(lang => {
          localStorage.removeItem(`revolving-${lang?.language}`)
        })
        
        toast.success('Success!! Post Updated', SuccessStyle)  
        navigate('/')
      }
      catch(err: unknown){
        const errors = (updateError as ErrorResponse) ?? (err as ErrorResponse)
        errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
        const message = errors?.status === 'FETCH_ERROR' ? 'SERVER ERROR' : (errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message)
        toast.error(`${message}`, ErrorStyle)
      }
      finally {
        dispatch(setLoading(false))
      }
    }
    return
  }

  const pushIntoStore = () => {
    const getStore = JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] ?? []
    const isPresent = getStore.find(code => code?.langType === inputValue.langType && code.code == inputValue.code)
    const edittedCode = getStore.find(code => code?.langType === inputValue.langType && code.code !== inputValue.code && code.codeId == inputValue.codeId)
    if(!isPresent && edittedCode == null){
      const codeId = nanoid(8)
      const codeDate = sub(new Date(), {minutes: 0}).toString()
      const newEntry = {...inputValue, codeId, date: codeDate} as CodeStoreType
      const newCodeArray = [...getStore, newEntry]
      setCodeStore(prev => ([...prev, newEntry]))
      setIsPresent({codeId: '', present: false})
      localStorage.setItem('revolving-codeStore', JSON.stringify(newCodeArray))
    }
    else if(edittedCode){
      const others = getStore.filter(code => code?.codeId !== inputValue.codeId)
      const edittedCodeArray = [...others, inputValue]
      setCodeStore([...edittedCodeArray])
      setIsPresent({codeId: '', present: false})
      setEditing({editing: false, codeId: '', code: '', type: 'NIL'})
      setSuccess({codeId: edittedCode.codeId as string, res: true})
      localStorage.setItem('revolving-codeStore', JSON.stringify(edittedCodeArray))
    }
    else {
      setIsPresent({codeId: isPresent?.codeId as string, present: true})
    }
  }

  const changeTheme = (mode: string) => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    localStorage.setItem('theme', mode);
  }

  return (
    <>
        {
          theme == 'dark' ? 
            <FiSun 
              onClick={() => changeTheme('light')}
              className={mode_class("SUN")} 
            /> 
          : 
            <BsMoonStars 
              onClick={() => changeTheme('dark')}
              className={mode_class("MOON")} 
            />
        }

        {
          !exclude?.includes(pathname) ?
            <div 
              title='Notifications'
              onClick={() => setOpenNotification(prev => (prev === 'Hide' ? prev = 'Open' : prev = 'Hide'))}
              className="relative cursor-pointer">
              <BiMessageDots 
                className={`${openNotification === 'Open' ? 'text-gray-400' : 'text-gray-500'} text-2xl hover:text-gray-600 transition-all`}
              />
              <span className={`text-sm rounded ${unreadNotifications?.length ? 'block' : 'scale-0 hidden'} bg-slate-600 transition-all grid place-content-center absolute -right-1 -bottom-1 text-white p-2 w-4 h-3.5`}>{checkCount(unreadNotifications)}</span>
            </div>
          : null
        }
          {address?.includes(pathname) ? 
            (
              pathname == '/new_story' ? (
                codeEditor ? (
                  <button
                    title='Push to store'
                    className={`text-[13px] rounded-lg pb-0.5 pt-0.5 shadow-lg active:scale-[0.98] duration-200 ease-in-out pl-2.5 pr-2.5 bg-green-400 hover:text-gray-500  hover:scale-[1.02]`}
                    onClick={pushIntoStore}
                    // disabled = {!canPost}
                    >{editing.editing ? 'Update' : 'Push'}
                  </button>
                ) : (
                  <button
                    className={`text-[13px] rounded-md p-0.5 shadow-lg duration-200 ease-in-out pl-1.5 pr-1.5 ${(canPost && !isLoadingCreate) ? 'bg-green-400 hover:text-gray-500 active:scale-[0.98] hover:scale-[1.02]' : 'bg-gray-400'} ${isLoadingCreate ? 'cursor-not-allowed' : ''}`}
                    onClick={createNewStory}
                    disabled = {isLoadingCreate ? isLoadingCreate : !canPost}
                    >{isLoadingCreate ? 'Post...' : 'Publish'}
                  </button>
                )
              )
              :
              (
                pathname != `/story/${storyId}` &&
                  <button
                    className={`text-[13px] rounded-lg p-0.5 shadow-lg duration-200 ease-in-out pl-1.5 pr-1.5 ${(canPost && !isLoadingUpdate) ? 'bg-green-400 hover:text-gray-500 active:scale-[0.98] hover:scale-[1.02]' : 'bg-gray-400'} ${isLoadingUpdate ? 'cursor-not-allowed' : ''}`}
                      onClick={updatedPost}
                      disabled = {isLoadingUpdate ? isLoadingUpdate : !canPost}
                    >{isLoadingUpdate ? 'Wait...' : 'Republish'}
                  </button>
              )
            )
          :
            !exclude?.includes(pathname) ?
              <Link to={'/new_story'} >
                <div className={`flex items-center cursor-pointer ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} hover:text-gray-600 transition-all ease-linear font-normal ml-2`}>
                  <FiEdit className='text-xl' />
                  <span className=''>Post</span>
                </div>
              </Link>
            : null
          }
        {
          address.includes(pathname) && 
          <IoIosMore title='Change font'
            onClick={() => setFontOption(prev => !prev)}
            className='relative cursor-pointer text-xl hover:text-gray-500 duration-200 ease-in' /> 
        }
        {
          !exclude?.includes(pathname) ?
            <div className='w-10 h-10 rounded-full p-1 flex'>
                 
                  <figure 
                     onClick={() => { 
                      setRollout(true)
                      setOpenChat('Hide')
                    }}
                    className='w-8 h-8 bg-slate-800 rounded-full border-2 border-gray-300 cursor-pointer'>
                    {
                      currentUser?.displayPicture?.photo ?
                        <img src={currentUser?.displayPicture?.photo} alt="dp" loading='eager'
                          className='object-cover h-full w-full rounded-full' 
                        />
                      : null
                    }
                  </figure>
            </div>
          : null
        }
    
        {/* {!address.includes(pathname) ? 
                <IoIosArrowDown 
                  onClick={() => setRollout(prev => !prev)}
                  className={`sm:hidden -ml-3 font-thin ${arrow_class}`} /> : null
        } */}
    </>
  )
}