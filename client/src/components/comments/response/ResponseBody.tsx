import { format } from "timeago.js";
import { CommentProps, CommentResponseProps, OpenReply } from "../../../data";
import { reduceLength } from "../../../utils/navigator";
import { PromptLiterals, Theme } from "../../../posts";
import { useState, useEffect, useRef } from 'react';
import { MdOutlineExpandMore } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setEditResponse } from "../../../features/story/commentSlice";
import ResponseBase from "./ResponseBase";


type ResponseBodyProps = {
  response: CommentResponseProps,
  userId: string,
  theme: Theme,
  targetComment: CommentProps,
  isLoadingResponses: boolean
}

function buttonOptClass(theme: Theme){
  return `shadow-2xl shadow-slate-900 hover:scale-[1.04] active:scale-[1] transition-all text-center cursor-pointer p-1 pt-0.5 pb-0.5 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-300 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
}

export const ResponseBody = ({ response, theme, userId, targetComment, isLoadingResponses }: ResponseBodyProps) => {
  const [reveal, setReveal] = useState<boolean>(false);
  const [expand, setExpand] = useState<boolean>(false);
  const [writeReply, setWriteReply] = useState<string>('');
  const [keepPrompt, setKeepPrompt] = useState<PromptLiterals>('Dommant');
  const [openReply, setOpenReply] = useState<OpenReply>({type: 'nil', assert: false})
  const responseRef = useRef<HTMLTextAreaElement>();
  const dispatch = useDispatch();

  const closeInput = () => {
    !writeReply.length ? setOpenReply({type: 'nil', assert: false}) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }

  return (
    <article 
      className={`relative text-sm flex flex-col gap-1 p-1.5 transition-all ${isLoadingResponses ? 'animate-pulse' : ''}`}>
        <div className={`flex items-center justify-between pr-2`}>
        <div 
          onClick={closeInput}
          className={`flex items-center gap-4 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
          <p 
            className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}>{reduceLength(response?.author, 15) || 'anonymous'}</p>
          <span className="font-bold text-black">.</span>
          <p className="text-xs text-gray-950">{format(response?.responseDate)}</p>
        </div>
        <MdOutlineExpandMore
          onClick={() => {
              setExpand(prev => !prev)
              dispatch(setEditResponse({...response, response: ''}))
            }
          }
          className={`text-xl ${expand ? 'text-gray-300' : ''} ${response?.userId === userId ? 'text-gray-300 block' : 'hidden'} hover:text-gray-300 cursor-pointer ${expand ? null : 'rotate-180'}`}
        />
        {
          <p className={`absolute ${(expand && response?.userId === userId) ? 'block' : 'hidden'} p-0.5 gap-0.5 shadow-lg transition-all right-5 top-5 flex flex-col items-center border border-1 rounded-md text-xs ${theme == 'light' ? 'border-gray-400 bg-slate-700' : 'border-gray-900 shadow-slate-800'}`}>
            <span 
              className={buttonOptClass(theme)}>
              Edit
            </span>
            <span 
              // onClick={deleteSingleComment}
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
        {reveal ? response?.response : reduceLength(response?.response, 60, 'word')}
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