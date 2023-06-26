import { reduceLength } from "../../utils/navigator";
import { CommentProps, ErrorResponse, Prompted } from "../../data"
import { format } from 'timeago.js';
import { PromptLiterals, Theme, ThemeContextType } from "../../posts";
import CommentBase from "./CommentBase";
import { useEffect, useRef, useState } from "react";
import { MdOutlineExpandMore } from 'react-icons/md'
import { useDispatch, useSelector } from "react-redux";
import { setEditComment } from "../../features/story/commentSlice";
import { useDeleteCommentMutation } from "../../app/api/commentApiSlice";
import { toast } from "react-hot-toast";
import { useThemeContext } from "../../hooks/useThemeContext";
import { storyApiSlice } from "../../app/api/storyApiSlice";
import { getTabCategory } from "../../features/story/navigationSlice";

type CommentType = {
  comment: CommentProps,
  theme: Theme,
  setOpenBox: React.Dispatch<React.SetStateAction<boolean>>,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>,
}

function buttonOptClass(theme: Theme){
  return `shadow-2xl shadow-slate-900 hover:scale-[1.04] active:scale-[1] transition-all text-center cursor-pointer p-1 pt-0.5 pb-0.5 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-300 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
}

export default function CommentCompo({ comment, theme, setPrompt, setOpenBox }: CommentType) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [reveal, setReveal] = useState<boolean>(false)
  const getNavigation = useSelector(getTabCategory)
  const [openReply, setOpenReply] = useState<boolean>(false)
  const [writeReply, setWriteReply] = useState<string>('');
  const [expand, setExpand] = useState<boolean>(false)
  const [keepPrompt, setKeepPrompt] = useState<PromptLiterals>('Dommant');
  const { setLoginPrompt } = useThemeContext() as ThemeContextType
  const responseRef = useRef<HTMLTextAreaElement>();
  const [deleteComment, { isLoading, isError, error, isSuccess: isSuccessDeleted, isUninitialized }] = useDeleteCommentMutation()
  const dispatch = useDispatch()

  useEffect(() => {
    openReply ? setOpenBox(true) : setOpenBox(false)
  }, [openReply, setOpenBox])

  const closeInput = () => {
    !writeReply ? setOpenReply(false) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }

  const deleteSingleComment = async() => {
    try{
      await deleteComment({userId: currentUserId, commentId: comment?._id}).unwrap()
      await storyApiSlice.useGetStoriesByCategoryQuery(getNavigation).refetch()
    }
    catch(err: unknown){
      const errors = error as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const editYourCommentPop = () => {
    dispatch(setEditComment(comment))
    setOpenReply(true)
    setExpand(false)
  }

  useEffect(() => {
    let isMounted = true
    if(!isUninitialized){
      isMounted ? setPrompt({type: 'delete', assert: isSuccessDeleted}) : null
    }
    return () => {
      isMounted = false
    }
  }, [isSuccessDeleted])

  return (
    <article 
      className={`relative text-sm flex flex-col gap-1 p-1.5 transition-all ${isLoading ? 'animate-pulse' : ''}`}>
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
          onClick={() => {
              setExpand(prev => !prev)
              dispatch(setEditComment({...comment, comment: ''}))
            }
          }
          className={`text-xl ${expand ? ' text-gray-300' : ''} hover:text-gray-300 cursor-pointer ${expand ? null : 'rotate-180'}`}
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
      <div className="relative flex items-center gap-4">
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
      </div>
    </article>
  )
}