import React from 'react'
import CommentBase from './CommentBase'
import { reduceLength } from '../../utils/navigator'
import { MdOutlineExpandMore } from 'react-icons/md'
import { format } from 'timeago.js'
import { useDispatch } from 'react-redux'
import { CommentProps, OpenReply, Prompted } from '../../data'
import { PromptLiterals, Theme, ThemeContextType } from '../../posts'
import { setEditComment } from '../../features/story/commentSlice'
import { useThemeContext } from '../../hooks/useThemeContext'

type BodyComponentProps = {
  comment: CommentProps,
  responseCom?: boolean,
  reveal: boolean
  expand: boolean
  currentUserId: string,
  writeReply: string,
  openReply: OpenReply,
  keepPrompt: PromptLiterals,
  responseRef: React.MutableRefObject<HTMLTextAreaElement>,
  deleteSingleComment: () => void,
  setOpenReply: React.Dispatch<React.SetStateAction<OpenReply>>,
  setWriteReply: React.Dispatch<React.SetStateAction<string>>,
  setKeepPrompt: React.Dispatch<React.SetStateAction<PromptLiterals>>,
  setExpand: React.Dispatch<React.SetStateAction<boolean>>,
  setReveal: React.Dispatch<React.SetStateAction<boolean>>,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>,
}

function buttonOptClass(theme: Theme){
  return `shadow-2xl shadow-slate-900 hover:scale-[1.04] active:scale-[1] transition-all text-center cursor-pointer p-1 pt-0.5 pb-0.5 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-300 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
}

export default function BodyComponent({ currentUserId, expand, reveal, comment, responseRef, writeReply, openReply, keepPrompt, setPrompt, setKeepPrompt, setExpand, setReveal, setOpenReply, setWriteReply, deleteSingleComment }: BodyComponentProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const dispatch = useDispatch();

  const closeInput = () => {
    !writeReply ? setOpenReply({type: 'nil', assert: false}) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }

  const editYourCommentPop = () => {
    dispatch(setEditComment(comment))
    setOpenReply({type: 'edit', assert: true})
    setExpand(false)
  }

  return (
    <>
        <div className={`flex items-center justify-between pr-2`}>
        <div 
          onClick={closeInput}
          className={`flex items-center gap-4 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
          <p 
            className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}>{reduceLength(comment.author, 15) || 'anonymous'}</p>
          <span className="font-bold text-black">.</span>
          <p className="text-xs text-gray-950">{format(comment.createdAt)}</p>
        </div>
        <MdOutlineExpandMore
          onClick={() => {
              setExpand(prev => !prev)
              dispatch(setEditComment({...comment, comment: ''}))
            }
          }
          className={`text-xl ${expand ? 'text-gray-300' : 'rotate-180'} ${comment?.userId === currentUserId ? 'text-gray-300 block' : 'hidden'} hover:text-gray-300 cursor-pointer ${theme == 'light' ? 'text-slate-600' : ''}`}
        />
        {
          <p className={`absolute ${(expand && comment?.userId === currentUserId) ? 'block' : 'hidden'} p-0.5 gap-0.5 shadow-lg transition-all right-5 top-5 flex flex-col items-center border border-1 rounded-md text-xs ${theme == 'light' ? 'border-gray-400 bg-slate-700' : 'border-gray-900 shadow-slate-800'}`}>
            <span 
              onClick={editYourCommentPop}
              className={buttonOptClass(theme)}>
              Edit
            </span>
            <span 
              onClick={deleteSingleComment}
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
        {reveal ? comment?.comment : reduceLength(comment?.comment, 60, 'word')}
      </p>
      <section className="relative flex items-center gap-4">
        <CommentBase mini 
          responseRef={
            responseRef as React.MutableRefObject<HTMLTextAreaElement>
          }
          userId={currentUserId} theme={theme} 
          comment={comment} 
          reveal={reveal}
          writeReply={writeReply} 
          setWriteReply={setWriteReply} 
          openReply={openReply} 
          setOpenReply={setOpenReply}
          keepPrompt={keepPrompt} 
          setKeepPrompt={setKeepPrompt}
          setPrompt={setPrompt}
        />
      </section>
    </>
  )
}