import { reduceLength } from "../../assets/navigator";
import { CommentProps } from "../../data"
import { format } from 'timeago.js';
import { PromptLiterals, Theme } from "../../posts";
import CommentBase from "./CommentBase";
import { useEffect, useRef, useState } from "react";

type CommentType = {
  comment: CommentProps,
  theme: Theme,
  setOpenBox: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CommentCompo({ comment, theme, setOpenBox }: CommentType) {
  const userId = localStorage.getItem('revolving_userId') as string
  const [reveal, setReveal] = useState<boolean>(false)
  const [openReply, setOpenReply] = useState<boolean>(false)
  const [writeReply, setWriteReply] = useState<string>('');
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
      className="text-sm flex flex-col gap-1 p-1.5">
      <div 
        onClick={closeInput}
        className={`flex items-center gap-4 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
        <p 
          className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}>{reduceLength(comment?.author, 15)}</p>
        <span className="font-bold text-black">.</span>
        <p className="text-xs text-gray-950">{format(comment?.commentDate)}</p>
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