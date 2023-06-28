import { ChangeEvent, useEffect } from 'react'
import { BsSend } from 'react-icons/bs'
import { useThemeContext } from '../../../hooks/useThemeContext'
import { PromptLiterals, ThemeContextType } from '../../../posts'
import { useDispatch, useSelector } from 'react-redux';
import { getEditResponses, setEditResponse } from '../../../features/story/commentSlice';
import { CommentProps, CommentResponseProps, ErrorResponse, OpenReply, Prompted } from '../../../data';
import { commentApiSlice } from '../../../app/api/commentApiSlice';
import { toast } from 'react-hot-toast';
import { sub } from 'date-fns';
import { useCreateResponseMutation, useUpdateResponseMutation } from '../../../app/api/responseApiSlice';

type WriteProp={
  writeReply: string,
  keepPrompt: PromptLiterals,
  currentUserId: string,
  response: CommentResponseProps,
  comment: CommentProps,
  openReply: OpenReply,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setOpenReply: React.Dispatch<React.SetStateAction<OpenReply>>,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>
}

// TODO: When Prompt is up, disable textarea

export default function WriteModal({ keepPrompt, comment, response, responseRef, openReply, currentUserId, writeReply, setWriteReply, setOpenReply, setPrompt }: WriteProp) {
  const { theme, enlarge, setLoginPrompt } = useThemeContext() as ThemeContextType;
  const dateTime = sub(new Date, { minutes: 0 }).toISOString();
  const getResponseEdit = useSelector(getEditResponses)
  const [updateResponse, { error, isError, isLoading, isSuccess, isUninitialized }] = useUpdateResponseMutation()
  const [createResponse, { error: errorResponse, isError: isErrorResponse, isLoading: isLoadingResponse, isSuccess: isSuccessResponse, isUninitialized: isUninitializedResponse }] = useCreateResponseMutation()
  const dispatch = useDispatch()

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => setWriteReply(event.target.value)

  useEffect(() => {
    let isMounted = true
    isMounted ? setWriteReply('' || getResponseEdit?.response) : null
    return () => {
      isMounted  = false
    }
  }, [])

  const handleSubmit = async() => {
    if(!writeReply.length) return
    const updatedResponse = {
      ...getResponseEdit,
      response: writeReply,
      editDate: dateTime
    }
    try{
      await updateResponse({ userId: currentUserId, 
        responseId: updatedResponse?._id,
        response: updatedResponse }).unwrap()
        setWriteReply('')
        setOpenReply({type: 'nil', assert: false})
        dispatch(setEditResponse({...updatedResponse, response: ''}))
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
 
  const handleReply = async() => {
    if(!writeReply.length) return
    const newResponse = {
      userId: currentUserId,
      responseId: response?._id,
      response: writeReply,
      responseDate: dateTime
    } as Partial<CommentResponseProps>
    try{
      await createResponse({ userId: currentUserId, 
        commentId: comment?._id,
        response: newResponse }).unwrap()
      setWriteReply('')
      setOpenReply({type: 'nil', assert: false})
      await commentApiSlice.useGetCommentQuery(response._id).refetch()
    }
    catch(err){
      const errors = error as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  useEffect(() => {
    let isMounted = true
    if(!isUninitialized){
      isMounted ? setPrompt({type: 'response', assert: isSuccess}) : null
    }
    return () => {
      isMounted = false
    }
  }, [isSuccess])
  
  useEffect(() => {
    let isMounted = true
    if(!isUninitializedResponse){
      isMounted ? setPrompt({type: 'response', assert: isSuccessResponse}) : null
    }
    return () => {
      isMounted = false
    }
  }, [isSuccessResponse])

  const canSubmit = Boolean(writeReply)

  const content = (
    <article className={`absolute w-full -bottom-[80px] z-50 ${enlarge.assert && 'left-0'}`}>
      <div 
        className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'} ${(isLoadingResponse) ? 'animate-pulse' : null}`}>
        <textarea 
          ref={responseRef}
          name="comment"
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
          disabled={isLoadingResponse && !canSubmit}
          onClick={openReply.type === 'reply' ? handleReply : openReply.type === 'edit' ? handleSubmit : () => {return}}
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