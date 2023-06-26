import { ChangeEvent, useEffect } from 'react'
import { BsSend } from 'react-icons/bs'
import { useThemeContext } from '../../hooks/useThemeContext'
import { PromptLiterals, ThemeContextType } from '../../posts'
import { useDispatch, useSelector } from 'react-redux';
import { getEditComments, setEditComment } from '../../features/story/commentSlice';
import { ErrorResponse, Prompted } from '../../data';
import { useUpdateCommentMutation } from '../../app/api/commentApiSlice';
import { toast } from 'react-hot-toast';
import { sub } from 'date-fns';

type WriteProp={
  writeReply: string,
  keepPrompt: PromptLiterals,
  currentUserId: string
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setOpenReply: React.Dispatch<React.SetStateAction<boolean>>,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>
}

// TODO: When Prompt is up, disable textarea

export default function WriteModal({ keepPrompt, responseRef, currentUserId, writeReply, setWriteReply, setOpenReply, setPrompt }: WriteProp) {
  const { theme, enlarge, setLoginPrompt } = useThemeContext() as ThemeContextType;
  const dateTime = sub(new Date, { minutes: 0 }).toISOString();
  const getCommentEdit = useSelector(getEditComments)
  const [updateComment, { error: errorComment, isError: isErrorComment, isLoading: isLoadingComment, isSuccess: isSuccessEdited, isUninitialized }] = useUpdateCommentMutation()
  const dispatch = useDispatch()

  const handleReply = (event: ChangeEvent<HTMLTextAreaElement>) => setWriteReply(event.target.value)

  useEffect(() => {
    let isMounted = true
    isMounted ? setWriteReply('' || getCommentEdit?.comment) : null
    return () => {
      isMounted  = false
    }
  }, [])

  const handleSubmit = async() => {
    if(!writeReply.length) return
    const updatedComment = {
      ...getCommentEdit,
      comment: writeReply,
      editDate: dateTime
    }
    try{
      await updateComment({ userId: currentUserId, 
        commentId: updatedComment?._id,
        comment: updatedComment }).unwrap()
        setWriteReply('')
        setOpenReply(false)
        dispatch(setEditComment({...updatedComment, comment: ''}))
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
      isMounted ? setPrompt({type: 'edit', assert: isSuccessEdited}) : null
    }
  
    return () => {
      isMounted = false
    }
  }, [isSuccessEdited])

  const content = (
    <article className={`absolute w-full -bottom-20 z-50 ${enlarge && 'bottom-16 left-0'}`}>
      <div className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} ${isLoadingComment ? 'animate-pulse' : null}`}>
        <textarea 
          ref={responseRef}
          name="comment"
          value={writeReply}
          disabled={keepPrompt == 'Show'}
          autoFocus={true}
          rows={3}
          autoComplete="off"
          placeholder="share your thought"
          onChange={handleReply}
          className={`flex-auto font-serif p-2 h-full w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
        ></textarea>
        <button 
          disabled={isLoadingComment}
          onClick={handleSubmit}
          className="flex-none w-12 hover:bg-opacity-50 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
      </div>
    </article>
  )

  return content
}