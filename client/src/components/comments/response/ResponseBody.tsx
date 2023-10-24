import { format } from "timeago.js";
import { toast } from "react-hot-toast";
import ResponseBase from "./ResponseBase";
import { useDispatch } from "react-redux";
import { MdOutlineExpandMore } from "react-icons/md";
import { useState, useCallback, useRef } from 'react';
import { useThemeContext } from "../../../hooks/useThemeContext";
import { commentApiSlice } from "../../../app/api/commentApiSlice";
import { ErrorStyle, reduceLength } from "../../../utils/navigator";
import { setEditResponse } from "../../../features/story/commentSlice";
import { useDeleteResponseMutation } from "../../../app/api/responseApiSlice";
import { PromptLiterals, Theme, ThemeContextType } from "../../../types/posts";
import { CommentProps, CommentResponseProps, ErrorResponse, OpenReply, Prompted } from "../../../types/data";


type ResponseBodyProps = {
  userId: string,
  authorId: string,
  // prompt: Prompted,
  isLoadingResponses: boolean,
  targetComment: CommentProps,
  response: CommentResponseProps,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>,
}

export const ResponseBody = ({ response, setPrompt, authorId, userId, targetComment, isLoadingResponses }: ResponseBodyProps) => {
  const [reveal, setReveal] = useState<boolean>(false);
  const [expand, setExpand] = useState<boolean>(false);
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [writeReply, setWriteReply] = useState<string>('');
  const [keepPrompt, setKeepPrompt] = useState<PromptLiterals>('Dommant');
  const [openReply, setOpenReply] = useState<OpenReply>({type: 'nil', assert: false})
  const responseRef = useRef<HTMLTextAreaElement>();
  const [deleteResponse, {isError, error}] = useDeleteResponseMutation()
  const dispatch = useDispatch();

  const buttonOptClass = useCallback((theme: Theme) => {
    return `shadow-2xl shadow-slate-900 hover:scale-[1.01] active:scale-[1] transition-all text-center cursor-pointer p-1 pt-0.5 pb-0.5 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-300 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
  }, [])
  

  const closeInput = () => {
    !writeReply.length ? setOpenReply({type: 'nil', assert: false}) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }

  const editYourResponsePop = () => {
    dispatch(setEditResponse(response))
    setOpenReply({type: 'edit', assert: true})
    setExpand(false)
  }

  const deleteSingleResponse = async() => {
    try{
      await deleteResponse({ userId, responseId: response?._id, authorId}).unwrap()
      dispatch(commentApiSlice.util.invalidateTags(['COMMENT']))
    }
    catch(err: unknown){
      const errors = (error as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
      isError && toast.error(`${errors?.status === 'FETCH_ERROR' ?
      'SERVER ERROR' : (errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message)}`, ErrorStyle)
    }
  }

  return (
    <article 
      className={`relative text-sm ${theme == 'light' ? 'bg-slate-200' : ''} flex flex-col gap-1 p-1.5 transition-all ${isLoadingResponses ? 'animate-pulse' : ''}`}>
        <div className={`flex items-center justify-between pr-2`}>
        <div 
          onClick={closeInput}
          className={`flex items-center gap-1.5 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
          <p 
            className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}>{reduceLength(response?.author, 15) || 'anonymous'}</p>
          <span className="font-bold text-black">.</span>
          <p className="text-xs text-gray-950">{format(response?.createdAt)}</p>
        </div>
        <MdOutlineExpandMore
          onClick={() => {
              setExpand(prev => !prev)
              dispatch(setEditResponse({...response, response: ''}))
            }
          }
          className={`text-xl ${theme == 'light' ? 'text-slate-600 hover:text-gray-500' : 'hover:text-gray-300'} ${response?.userId === userId ? 'text-gray-300 block' : 'hidden'} cursor-pointer ${expand ? 'text-slate-300' : 'rotate-180'}`}
        />
        {
          <p className={`absolute z-30 ${(expand && response?.userId === userId) ? 'block' : 'hidden'} p-0.5 gap-0.5 shadow-lg transition-all right-5 top-5 flex flex-col items-center border border-1 rounded-md text-xs ${theme == 'light' ? 'border-gray-400 bg-slate-700' : 'border-gray-900 shadow-slate-800'}`}>
            <span 
              onClick={editYourResponsePop}
              className={buttonOptClass(theme)}>
              Edit
            </span>
            <span 
              onClick={deleteSingleResponse}
              className={buttonOptClass(theme)}>
              Delete
            </span>
          </p>
        }
      </div>
      <p 
        onClick={closeInput}
        onDoubleClick={() => setReveal(prev => !prev)}
        className="cursor-grab text-justify tracking-wide first-letter:ml-3 first-letter:font-medium">
        {
          reveal ? 
            <FormattedContent content={response?.response} /> 
            : 
            <FormattedContent content={reduceLength(response?.response, 60, 'word')} />}
      </p>
      <div className="relative flex items-center gap-4">
        <ResponseBase
          responseRef={
            responseRef as React.MutableRefObject<HTMLTextAreaElement>
          }
          userId={userId} theme={theme} 
          response={response} 
          reveal={reveal}
          writeReply={writeReply} 
          // prompt={prompt}
          setPrompt={setPrompt}
          setWriteReply={setWriteReply} 
          openReply={openReply} 
          setOpenReply={setOpenReply}
          keepPrompt={keepPrompt} 
          setKeepPrompt={setKeepPrompt}
          comment={targetComment as CommentProps}
        />
      </div>  
    </article>
  )
}

type FormattedProp = {
  content: string
}

export const FormattedContent = ({ content }: FormattedProp) => {
  const username = content.split(' ')[0];
  const others = content?.split(' ').slice(1).join(' ');

  return (
  <span className='flex items-center'>
    <small className='text-gray-400'>{username}</small> &nbsp;
    <small>{others}</small>
  </span>)
}

