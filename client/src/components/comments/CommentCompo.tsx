import { reduceLength } from "../../assets/navigator";
import { CommentProps } from "../../data"
import { format } from 'timeago.js';
import { Theme } from "../../posts";
import CommentBase from "./CommentBase";
import { useState } from "react";

type CommentType = {
  comment: CommentProps,
  theme: Theme
}

export default function CommentCompo({ comment, theme }: CommentType) {
  const userId = localStorage.getItem('revolving_userId') as string
  const [reveal, setReveal] = useState<boolean>(false)
  const [openReply, setOpenReply] = useState<boolean>(false)

  return (
    <article 
      className="text-sm flex flex-col gap-1 p-1.5">
      <div 
        onClick={() => setOpenReply(false)}
        className={`flex items-center gap-4 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
        <p 
          className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}>{reduceLength(comment?.author, 15)}</p>
        <span className="font-bold text-black">.</span>
        <p className="text-xs text-gray-950">{format(comment?.commentDate)}</p>
      </div>
      <p 
        onClick={() => setOpenReply(false)}
        onDoubleClick={() => setReveal(prev => !prev)}
        className="cursor-grab text-justify tracking-wide first-letter:ml-3 first-letter:font-medium">
        {reveal ? comment?.comment : reduceLength(comment?.comment, 60, 'word')}
      </p>
      <div className="relative flex items-center gap-4">
        <CommentBase mini 
          userId={userId} theme={theme} 
          comment={comment} openReply={openReply} 
          setOpenReply={setOpenReply} 
        />
      </div>
    </article>
  )
}