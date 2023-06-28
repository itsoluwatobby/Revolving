import { CommentProps, ErrorResponse, OpenReply, Prompted } from "../../data"
import { PromptLiterals, ThemeContextType } from "../../posts";
import { useEffect, useRef, useState } from "react";
import { useDeleteCommentMutation } from "../../app/api/commentApiSlice";
import { toast } from "react-hot-toast";
import { useThemeContext } from "../../hooks/useThemeContext";
import { storyApiSlice } from "../../app/api/storyApiSlice";
import { getTabCategory } from "../../features/story/navigationSlice";
import BodyComponent from "./BodyComponent";
import { useSelector } from "react-redux";

type CommentType = {
  comment: CommentProps,
  setOpenBox: React.Dispatch<React.SetStateAction<boolean>>,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>,
}

export default function CommentCompo({ comment, setPrompt, setOpenBox }: CommentType) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [reveal, setReveal] = useState<boolean>(false)
  const getNavigation = useSelector(getTabCategory)
  const [openReply, setOpenReply] = useState<OpenReply>({type: 'nil', assert: false})
  const [writeReply, setWriteReply] = useState<string>('');
  const [expand, setExpand] = useState<boolean>(false)
  const [keepPrompt, setKeepPrompt] = useState<PromptLiterals>('Dommant');
  const { setLoginPrompt } = useThemeContext() as ThemeContextType
  const responseRef = useRef<HTMLTextAreaElement>();
  const [deleteComment, { isLoading, isError, error, isSuccess: isSuccessDeleted, isUninitialized }] = useDeleteCommentMutation()

  useEffect(() => {
    openReply.assert ? setOpenBox(true) : setOpenBox(false)
  }, [openReply.assert, setOpenBox])

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
      <BodyComponent 
        responseRef={
          responseRef as React.MutableRefObject<HTMLTextAreaElement>
        }
        currentUserId={currentUserId} 
        comment={comment} 
        reveal={reveal}
        expand={expand}
        writeReply={writeReply} 
        setWriteReply={setWriteReply} 
        openReply={openReply} 
        setOpenReply={setOpenReply}
        keepPrompt={keepPrompt} 
        setKeepPrompt={setKeepPrompt}
        setPrompt={setPrompt}  
        deleteSingleComment={deleteSingleComment}
        setExpand={setExpand} 
        setReveal={setReveal}
      />
    </article>
  )
}