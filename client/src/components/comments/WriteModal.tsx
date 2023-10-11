import { BsSend } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { ChangeEvent, useEffect } from 'react';
import { ErrorStyle } from '../../utils/navigator';
import { AiFillCloseSquare } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { useThemeContext } from '../../hooks/useThemeContext';
import { PromptLiterals, ThemeContextType } from '../../posts';
import { useCreateResponseMutation } from '../../app/api/responseApiSlice';
import { getEditComments, setEditComment } from '../../features/story/commentSlice';
import { commentApiSlice, useUpdateCommentMutation } from '../../app/api/commentApiSlice';
import { CommentProps, CommentResponseProps, ErrorResponse, OpenReply, Prompted } from '../../data';

type WriteProp={
  writeReply: string,
  enlarged?: boolean,
  openReply: OpenReply,
  currentUserId: string,
  comment: CommentProps,
  keepPrompt: PromptLiterals,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setOpenReply: React.Dispatch<React.SetStateAction<OpenReply>>,
  setKeepPrompt: React.Dispatch<React.SetStateAction<PromptLiterals>>
}

// TODO: When Prompt is up, disable textarea
export default function WriteModal({ keepPrompt, setKeepPrompt, enlarged, comment, responseRef, openReply, currentUserId, writeReply, setWriteReply, setOpenReply, setPrompt }: WriteProp) {
  const { theme, enlarge, setLoginPrompt, setEnlarge, setParseId } = useThemeContext() as ThemeContextType;
  const getCommentEdit = useSelector(getEditComments)
  const [updateComment, { error: errorComment, isError: isErrorComment, isLoading: isLoadingComment, isSuccess: isSuccessEdited, isUninitialized }] = useUpdateCommentMutation()
  const [createResponse, { error: errorResponse, isError: isErrorResponse, isLoading: isLoadingResponse }] = useCreateResponseMutation()
  const dispatch = useDispatch()

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => setWriteReply(event.target.value)

  useEffect(() => {
    let isMounted = true
    if(isMounted){
      const username = '@'+getCommentEdit.author+' '
      openReply.type === 'edit' ? setWriteReply('' || getCommentEdit?.comment) : openReply.type === 'reply' ? setWriteReply(username) : null
    }
    return () => {
      isMounted  = false
    }
  }, [getCommentEdit?.author, getCommentEdit?.comment, setWriteReply, openReply])

  const closeInput = () => {
    !writeReply ? setOpenReply({type: 'nil', assert: false}) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }

  const updateEditComment = async() => {
    if(!writeReply.length) return
    const updatedComment = {
      ...getCommentEdit,
      comment: writeReply
    }
    try{
      await updateComment({ userId: currentUserId, 
        commentId: updatedComment?._id,
        comment: updatedComment }).unwrap()
        setWriteReply('')
        setOpenReply({type: 'nil', assert: false})
        enlarged ? dispatch(setEditComment({...updatedComment, comment: ''})) : null
    }
    catch(err){
      const errors = (errorComment as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
      isErrorComment && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  const createNewResponse = async() => {
    if(!writeReply.length) return
    const newResponse = {
      userId: currentUserId,
      commentId: comment?._id,
      response: writeReply
    } as Partial<CommentResponseProps>
    try{
      await createResponse({ userId: currentUserId, 
        commentId: comment?._id,
        response: newResponse }).unwrap()
      setWriteReply('')
      setOpenReply({type: 'nil', assert: false})
      setEnlarge({type: 'open', assert: true})
      setParseId(comment?._id)
      dispatch(commentApiSlice.util.invalidateTags(['COMMENT']))
    }
    catch(err){
      const errors = errorResponse as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
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
  }, [isSuccessEdited, isUninitialized, setPrompt])
  
  // useEffect(() => {
  //   let isMounted = true
  //   if(!isUninitializedResponse){
  //     isMounted ? setPrompt({type: 'response', assert: isSuccessResponse}) : null
  //   }
  
  //   return () => {
  //     isMounted = false
  //   }
  // }, [isSuccessResponse])
  
  const canSubmit = Boolean(writeReply)

  const content = (
    <article className={`absolute w-full text-white ${openReply.pos == 'enlarge' ? '-bottom-20' : '-bottom-[80px]'} z-50 ${enlarge.assert && 'left-0'}`}>
      <div 
        className={`relative w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'}`}>
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
          className={`flex-auto font-serif p-2 h-full w-10/12 focus:outline-none rounded-md bg-inherit ${(isLoadingComment || isLoadingResponse) ? 'animate-pulse' : null}`}
        ></textarea>
        <button 
          disabled={isLoadingComment && !canSubmit}
          onClick={openReply.type === 'reply' ? createNewResponse : openReply.type === 'edit' ? updateEditComment : () => {return}}
          className="flex-none w-12 hover:bg-opacity-50 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
        <AiFillCloseSquare 
          onClick={closeInput}
          className={`absolute top-0 right-0 text-lg text-gray-300 rounded-full cursor-pointer hover:opacity-80 transition-all`}
        />
      </div>
    </article>
  )

  return content
}