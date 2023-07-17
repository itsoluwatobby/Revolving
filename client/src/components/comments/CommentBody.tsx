import { BsSend } from 'react-icons/bs'
import { MdCancel } from 'react-icons/md'
import CommentCompo from './CommentCompo'
import { useThemeContext } from '../../hooks/useThemeContext'
import { ChatOption, ThemeContextType } from '../../posts'
import { ChangeEvent, useState, useEffect } from 'react'
import { SkeletonComment } from '../skeletons/SkeletonComment'
import { CommentProps, ErrorResponse, Prompted } from '../../data'
import { useCreateCommentMutation, useGetCommentsQuery } from '../../app/api/commentApiSlice'
import { useDispatch, useSelector } from 'react-redux'
import { setAllComments } from '../../features/story/commentSlice'
import { toast } from 'react-hot-toast'
import { storyApiSlice } from '../../app/api/storyApiSlice'
import { getTabCategory } from '../../features/story/navigationSlice'
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types'
import { REFRESH_RATE } from '../../utils/navigator'


export default function CommentBody() {
  const getNavigation = useSelector(getTabCategory)
  const { theme, openComment, setOpenComment, setLoginPrompt } = useThemeContext() as ThemeContextType;
  const [deactivateInputBox, setDeactivateInputBox] = useState<boolean>(false);
  const currentUserId = localStorage.getItem('revolving_userId') as string;
  const { data, isLoading, isError, error, refetch } = useGetCommentsQuery(openComment?.storyId);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>();
  const [createComment, { isLoading: isLoadingComment, isUninitialized, isSuccess: isCommentSuccess, isError: isErrorComment, error: errorComment }] = useCreateCommentMutation()
  const dispatch = useDispatch();
  const [successModal, setSuccessModal] = useState<ChatOption>('Hide');
  const [prompt, setPrompt] = useState<Prompted>({type: 'nil', assert: false});

  const handleComment = (event: ChangeEvent<HTMLInputElement>) => setComment(event.target.value)

  const createNewComment = async() => {
    if(!comment) return
    const newComment = {
      userId: currentUserId,
      storyId: openComment?.storyId,
      comment
    } as Partial<CommentProps>
    try{
      await createComment({ userId: currentUserId, 
        storyId: openComment?.storyId, 
        comment: newComment }).unwrap()
      setComment('')
      await storyApiSlice.useGetStoriesByCategoryQuery(getNavigation).refetch()
    }
    catch(err){
      const errors = errorComment as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isErrorComment && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  useEffect(() => {
    let isMounted = true
    if(!isUninitialized){
      isMounted ? setPrompt({type: 'create', assert: isCommentSuccess}) : null
    }
    return () => {
      isMounted = false
    }
  }, [isCommentSuccess, isUninitialized])

  useEffect(() => {
    let isMounted = true

    const activate = () => {
      if(prompt?.assert) setSuccessModal('Open') 
    }
    isMounted ? activate() : null

    const timerId = setTimeout(() => {
      setSuccessModal('Hide')
      setPrompt({type: 'nil', assert: false})
    }, 1500);
    
    return () => {
      clearTimeout(timerId)
      isMounted = false
    }
  }, [prompt?.assert])

  useEffect(() => {
    let timerId: TimeoutId
    if(!data?.length && isError && errorMsg?.status != 404){
      timerId = setInterval(async() => {
        await refetch()
      }, REFRESH_RATE)
    }
    return () => clearInterval(timerId)
  }, [data, isError, errorMsg?.status, refetch])

  useEffect(() => {
    let isMounted = true
    isMounted && setComments(data as CommentProps[])
    isMounted && dispatch(setAllComments(data as CommentProps[]))
    return () => {
      isMounted = false
    }
  }, [data, dispatch])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  let commentContent;

  isLoading ? commentContent = (
    [...Array(5).keys()].map(i => (
      <SkeletonComment key={i} />
    ))
  )
  : isError ? commentContent = (
    <p className='text-center mt-10 text-sm'>
      {
        errorMsg?.status == 404 ? 
          <span className='flex flex-col gap-2 font-serif'>
            <small>No comments yet</small>
            <small>Say something to start the converstion</small>
          </span> 
          : 
          <span>Network Error, Please check your connection</span>
        }
      </p>
  ) : commentContent = (
    <>
      {!isLoading && comments?.length ? 
        (
          comments.map(comment => (
            <CommentCompo 
              key={comment?._id}
              comment={comment as CommentProps}  
              setDeactivateInputBox={setDeactivateInputBox}
              setPrompt={setPrompt}
            />
          ))
        ) : null
      }
    </>
  )

  let successMsg;
  prompt.type == 'create' ? successMsg = 'Success 🍡' : prompt.type == 'delete' ? successMsg = 'Comment Deleted' : prompt.type == 'edit' ? successMsg = 'success 🍬' : prompt.type == 'response' ? successMsg = 'success ✔️' : null

  return (
    <>
       <MdCancel
        onClick={() => setOpenComment({ option: 'Hide', storyId: '' })}
        className={`absolute top-0 right-0 text-gray-800 text-2xl cursor-pointer hover:opacity-70`}/>
      <div
        onKeyUpCapture={event => event.key === 'Enter' ? createNewComment() : null}
        className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'}  ${isLoadingComment ? 'animate-pulse' : null}`}>
        <input 
          type="text"
          name="comment"
          autoFocus={true}
          disabled={deactivateInputBox}
          value={comment}
          autoComplete="off"
          placeholder="share your thought"
          onChange={handleComment}
          className={`flex-auto tracking-wide font-serif p-1.5 h-full text-sm w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
        />
        <button 
          disabled={isLoadingComment}
          onClick={createNewComment}
          className="flex-none w-12 hover:bg-opacity-50 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
      </div>
      <div className="hidebars relative w-full overflow-y-scroll mt-1 flex flex-col">
        <>
          {commentContent}
          <p className={`absolute ${successModal === 'Open' ? 'scale-100' : 'scale-0'} z-30 transition-all ${(prompt.type == 'create' || prompt.type == 'edit') ? 'bg-green-600' : prompt.type == 'response' ? 'bg-blue-600' : (prompt.type == 'delete' && 'bg-red-600')} p-3.5 pt-1 pb-1 rounded-lg shadow-2xl tracking-wide text-sm font-mono shadow-slate-800 top-7 right-1/3 bg-opacity-90 border-2 border-gray-500`}>
          {successMsg}
        </p>
        </>
      </div>
    </>
  )
}


// (prompt.type == 'create' || prompt.type == 'edit') ? 'Success 🍡' : (prompt.type == 'delete' && 'Comment Deleted')