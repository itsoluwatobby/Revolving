import { BsSend } from 'react-icons/bs'
import { MdCancel } from 'react-icons/md'
import CommentCompo from './CommentCompo'
import { useThemeContext } from '../../hooks/useThemeContext'
import { ThemeContextType } from '../../posts'
import { ChangeEvent, useState, useEffect } from 'react'
import { SkeletonComment } from '../skeletons/SkeletonComment'
import { CommentProps, ErrorResponse } from '../../data'
import { useCreateCommentMutation, useGetCommentsQuery } from '../../app/api/commentApiSlice'
import { useDispatch, useSelector } from 'react-redux'
import { setAllComments } from '../../features/story/commentSlice'
import { toast } from 'react-hot-toast'
import { sub } from 'date-fns'
import { storyApiSlice } from '../../app/api/storyApiSlice'
import { getTabCategory } from '../../features/story/navigationSlice'

export default function CommentBody() {
  const getNavigation = useSelector(getTabCategory)
  const { theme, openComment, setOpenComment, setLoginPrompt } = useThemeContext() as ThemeContextType;
  const [openBox, setOpenBox] = useState<boolean>(false);
  const currentUserId = localStorage.getItem('revolving_userId') as string;
  const { data, isLoading, 
    isError, error 
  } = useGetCommentsQuery(openComment?.storyId);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>();
  const [createComment, { isLoading: isLoadingComment, isError: isErrorComment, error: errorComment }] = useCreateCommentMutation()
  const dispatch = useDispatch();
  const dateTime = sub(new Date, { minutes: 0 }).toISOString();

  const handleComment = (event: ChangeEvent<HTMLInputElement>) => setComment(event.target.value)

  const createNewComment = async() => {
    if(!comment) return
    const newComment = {
      userId: currentUserId,
      storyId: openComment?.storyId,
      commentDate: dateTime,
      comment
    } as Partial<CommentProps>
    try{
      await createComment({ userId: currentUserId, 
        storyId: openComment?.storyId, 
        comment: newComment }).unwrap()
        setComment('')
        await storyApiSlice.useGetStoriesByCategoryQuery(getNavigation).refetch()
        toast.success('Success!! Comment added',{
            duration: 2000, icon: '🔥', 
            style: { background: '#3CB371' }
          }
        )
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
  
  const editComment = async() => {
    try{
      ''
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
    <p className='text-center mt-10 text-lg'>{errorMsg?.data.meta.message}</p>
  ) : commentContent = (
    <>
      {!isLoading && comments?.length ? 
        (
          comments.map(comment => (
            <CommentCompo 
              key={comment?._id}
              comment={comment as CommentProps} 
              theme={theme} 
              setOpenBox={setOpenBox}
            />
          ))
        ) : null
      }
    </>
  )

  return (
    <>
       <MdCancel
        onClick={() => setOpenComment({ option: 'Hide', storyId: '' })}
        className={`absolute top-0 right-0 text-gray-800 text-2xl cursor-pointer hover:opacity-70`}/>
      <div
        onKeyUpCapture={event => event.key === 'Enter' ? createNewComment : null}
        className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'}  ${isLoadingComment ? 'animate-pulse' : null}`}>
        <input 
          type="text"
          name="comment"
          autoFocus={true}
          disabled={openBox}
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
      <div className="hidebars relative w-full overflow-y-scroll mt-2 flex flex-col">
        {commentContent}
      </div>
    </>
  )
}