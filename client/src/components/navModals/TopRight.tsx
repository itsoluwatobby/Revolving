import { sub } from "date-fns";
import { FiSun } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { FiEdit } from 'react-icons/fi';
import { nanoid } from "@reduxjs/toolkit";
import { IoIosMore } from 'react-icons/io';
import { BsMoonStars } from "react-icons/bs";
import { ErrorResponse, UserProps } from "../../data";
import { useDispatch, useSelector } from "react-redux";
import { usePostContext } from "../../hooks/usePostContext";
import { useThemeContext } from "../../hooks/useThemeContext";
import { ErrorStyle, SuccessStyle } from "../../utils/navigator";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CodeStoreType, PostContextType, PostType, ThemeContextType } from "../../posts";
import { useCreateStoryMutation, useUpdateStoryMutation } from "../../app/api/storyApiSlice";
import { getStoryData, getUrl, resetUrl, setLoading } from "../../features/story/storySlice";

const arrow_class= "text-base text-gray-400 cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

const mode_class= "text-lg cursor-pointer shadow-lg hover:scale-[1.1] active:scale-[0.98] hover:text-gray-500 duration-200 ease-in-out"

type TopRightProps = {
  currentUser: UserProps
}
export default function TopRight({ currentUser }: TopRightProps) {
  const [updateStory, {isLoading: isLoadingUpdate, error: updateError, isError: isUpdateError}] = useUpdateStoryMutation()
  const [createStory, {isLoading: isLoadingCreate, error: createError, isError: isCreateError}] = useCreateStoryMutation()
  const { theme, codeEditor, editing, setRollout, setSuccess, setEditing, changeTheme, setIsPresent, setFontOption, setLoginPrompt 
  } = useThemeContext() as ThemeContextType
  const { canPost, inputValue, setCodeStore, submitToSend, setImagesFiles } = usePostContext() as PostContextType
  const storyData = useSelector(getStoryData)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const url = useSelector(getUrl)
  const { storyId } = useParams()
  const dispatch = useDispatch()

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]
  const exclude = ['/signIn', '/signUp', '/new_password', '/otp']

  const createNewStory = async() => {
    if(!storyData.userId) return setLoginPrompt('Open')
    if(storyData){
      const adjustCodes = submitToSend?.map(code => {
        const { codeId, ...rest } = code
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
          toast.success('Success!! Post added', SuccessStyle)
          dispatch(resetUrl())
          setImagesFiles([])
          dispatch(setLoading(false))
          navigate('/')
      }
      catch(err: unknown){
        const errors = (createError as ErrorResponse) ?? (err as ErrorResponse)
        errors?.originalStatus == 401 && setLoginPrompt('Open')
        isCreateError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
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
        return rest
      })
      dispatch(setLoading(isLoadingUpdate))
      const userId = storyData.userId as string
      const story = {...storyData, code: [...adjustCodes]} as PostType
      try{
        await updateStory({ userId, storyId: story?._id, story }).unwrap()
        localStorage.removeItem(`editTitle?id=${userId}`)
        localStorage.removeItem(`editBody?id=${userId}`)
        
        toast.success('Success!! Post Updated', SuccessStyle)  
        navigate('/')
      }
      catch(err: unknown){
        const errors = (updateError as ErrorResponse) ?? (err as ErrorResponse)
        errors?.originalStatus == 401 && setLoginPrompt('Open')
        isUpdateError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
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
                    disabled = {isCreateError ? isCreateError : isLoadingCreate ? isLoadingCreate : !canPost}
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
                      disabled = {isUpdateError ? isUpdateError : isLoadingUpdate ? isLoadingUpdate : !canPost}
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
                     onClick={() => setRollout(true)}
                    className='w-8 h-8 bg-slate-800 rounded-full border-2 border-gray-300 cursor-pointer'>
                    {
                      currentUser?.displayPicture?.photo ?
                        <img src={currentUser?.displayPicture?.photo} alt="dp" 
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