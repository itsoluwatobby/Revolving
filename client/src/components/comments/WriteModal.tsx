import { ChangeEvent, useEffect } from 'react'
import { BsSend } from 'react-icons/bs'
import { useThemeContext } from '../../hooks/useThemeContext'
import { PromptLiterals, ThemeContextType } from '../../posts'
import { useDispatch, useSelector } from 'react-redux';
import { getEditComments, setEditComment } from '../../features/story/commentSlice';
import { CommentProps, CommentResponseProps, ErrorResponse, OpenReply, Prompted } from '../../data';
import { commentApiSlice, useUpdateCommentMutation } from '../../app/api/commentApiSlice';
import { toast } from 'react-hot-toast';
import { sub } from 'date-fns';
import { useCreateResponseMutation } from '../../app/api/responseApiSlice';

type WriteProp={
  writeReply: string,
  keepPrompt: PromptLiterals,
  currentUserId: string,
  comment: CommentProps,
  openReply: OpenReply,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setOpenReply: React.Dispatch<React.SetStateAction<OpenReply>>,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>
}

// TODO: When Prompt is up, disable textarea

export default function WriteModal({ keepPrompt, comment, responseRef, openReply, currentUserId, writeReply, setWriteReply, setOpenReply, setPrompt }: WriteProp) {
  const { theme, enlarge, setLoginPrompt } = useThemeContext() as ThemeContextType;
  const dateTime = sub(new Date, { minutes: 0 }).toISOString();
  const getCommentEdit = useSelector(getEditComments)
  const [updateComment, { error: errorComment, isError: isErrorComment, isLoading: isLoadingComment, isSuccess: isSuccessEdited, isUninitialized }] = useUpdateCommentMutation()
  const [createResponse, { error: errorResponse, isError: isErrorResponse, isLoading: isLoadingResponse, isSuccess: isSuccessResponse, isUninitialized: isUninitializedResponse }] = useCreateResponseMutation()
  const dispatch = useDispatch()

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => setWriteReply(event.target.value)

  useEffect(() => {
    let isMounted = true
    isMounted ? setWriteReply('' || getCommentEdit?.comment) : null
    return () => {
      isMounted  = false
    }
  }, [])

  const updateEditComment = async() => {
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
        setOpenReply({type: 'nil', assert: false})
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
 
  const createNewResponse = async() => {
    if(!writeReply.length) return
    const newResponse = {
      userId: currentUserId,
      commentId: comment?._id,
      response: writeReply,
      responseDate: dateTime
    } as Partial<CommentResponseProps>
    try{
      await createResponse({ userId: currentUserId, 
        commentId: comment?._id,
        response: newResponse }).unwrap()
      setWriteReply('')
      setOpenReply({type: 'nil', assert: false})
      await commentApiSlice.useGetCommentQuery(comment._id).refetch()
    }
    catch(err){
      const errors = errorResponse as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isErrorResponse && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
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
  
  // useEffect(() => {
  //   let isMounted = true
  //   if(!isUninitializedResponse){
  //     isMounted ? setPrompt({type: 'response', assert: isSuccessResponse}) : null
  //   }
  
  //   return () => {
  //     isMounted = false
  //   }
  // }, [isSuccessResponse])
  // ${enlarge.assert && (enlarge.type === 'open' ? 'button-[88px] left-0' : 'bottom-[40px] left-0')}
  const canSubmit = Boolean(writeReply)
//(enlarge.type === 'open' ? 'top-[88px] left-0' :
// TODO:SORT THIS OUT
  const content = (
    <article className={`absolute ${enlarge.type === 'open' ?'w- w-[95%] left-3 bottom-8' : 'w-full'} -bottom-[80px] z-50`}>
      <div 
        className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} ${(isLoadingComment || isLoadingResponse) ? 'animate-pulse' : null}`}>
        <textarea 
          ref={responseRef}
          key={openReply.type}
          value={writeReply}
          disabled={keepPrompt == 'Show'}
          autoFocus={true}
          rows={3}
          autoComplete="off"
          placeholder="share your thought"
          onChange={handleChange}
          className={`flex-auto font-serif p-2 h-full w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
        ></textarea>
        <button 
          disabled={isLoadingComment && !canSubmit}
          onClick={openReply.type === 'reply' ? createNewResponse : openReply.type === 'edit' ? updateEditComment : () => {return}}
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