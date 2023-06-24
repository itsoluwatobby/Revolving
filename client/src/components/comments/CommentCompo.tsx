import { reduceLength } from "../../utils/navigator";
import { CommentProps } from "../../data"
import { format } from 'timeago.js';
import { PromptLiterals, Theme } from "../../posts";
import CommentBase from "./CommentBase";
import { useEffect, useRef, useState } from "react";
import { MdOutlineExpandMore } from 'react-icons/md'

type CommentType = {
  comment: CommentProps,
  theme: Theme,
  setOpenBox: React.Dispatch<React.SetStateAction<boolean>>
}

function buttonOptClass(theme: Theme, first=false){
  return `shadow-2xl shadow-slate-900 hover:scale-[1.04] active:scale-[1] transition-all text-center cursor-pointer p-1 pt-0.5 pb-0.5 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-300 hover:text-gray-500' : 'bg-slate-700 hover:text-gray-300'}`
}

export default function CommentCompo({ comment, theme, setOpenBox }: CommentType) {
  const userId = localStorage.getItem('revolving_userId') as string
  const [reveal, setReveal] = useState<boolean>(false)
  const [openReply, setOpenReply] = useState<boolean>(false)
  const [writeReply, setWriteReply] = useState<string>('');
  const [expand, setExpand] = useState<boolean>(false)
  const [keepPrompt, setKeepPrompt] = useState<PromptLiterals>('Dommant');
  const responseRef = useRef<HTMLTextAreaElement>();

  useEffect(() => {
    openReply ? setOpenBox(true) : setOpenBox(false)
  }, [openReply, setOpenBox])

  const closeInput = () => {
    !writeReply.length ? setOpenReply(false) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }

  return (
    <article 
      className="relative text-sm flex flex-col gap-1 p-1.5 transition-all">
      <div className={`flex items-center justify-between pr-2`}>
        <div 
          onClick={closeInput}
          className={`flex items-center gap-4 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
          <p 
            className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}>{reduceLength(comment?.author, 15) || 'anonymous'}</p>
          <span className="font-bold text-black">.</span>
          <p className="text-xs text-gray-950">{format(comment?.commentDate)}</p>
        </div>
        <MdOutlineExpandMore
          onClick={() => setExpand(prev => !prev)}
          className={`text-xl hover:text-gray-300 cursor-pointer ${expand ? null : 'rotate-180'}`}
        />
        {
            <p className={`absolute ${expand ? 'block' : 'hidden'} p-0.5 gap-0.5 shadow-lg transition-all right-0 top-6 flex flex-col items-center border border-1 rounded-md text-xs ${theme == 'light' ? '' : 'border-gray-500 shadow-slate-800'}`}>
            <span className={buttonOptClass(theme, true)}>
              Edit
            </span>
            <span className={buttonOptClass(theme)}>
              Delete
            </span>
          </p>
        }
      </div>
      <p 
        onClick={closeInput}
        onDoubleClick={() => setReveal(prev => !prev)}
        className="cursor-grab text-justify tracking-wide first-letter:ml-3 first-letter:font-medium">
        {reveal ? comment?.comment : reduceLength(comment?.comment, 60, 'word')}
      </p>
      <div className="relative flex items-center gap-4">
        <CommentBase mini 
          responseRef={
            responseRef as React.MutableRefObject<HTMLTextAreaElement>
          }
          userId={userId} theme={theme} 
          comment={comment} 
          writeReply={writeReply} 
          setWriteReply={setWriteReply} 
          openReply={openReply} 
          setOpenReply={setOpenReply} 
          keepPrompt={keepPrompt} 
          setKeepPrompt={setKeepPrompt} 
        />
      </div>
    </article>
  )
}