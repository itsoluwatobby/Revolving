import { toast } from "react-hot-toast";
import BodyComponent from "./BodyComponent";
import { ThemeContextType } from "../../posts";
import { ErrorStyle } from "../../utils/navigator";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "../../hooks/useThemeContext";
import { useDeleteCommentMutation } from "../../app/api/commentApiSlice";
import { CommentProps, ErrorResponse, OpenReply, Prompted } from "../../data";

type CommentType = {
  comment: CommentProps,
  setPrompt: React.Dispatch<React.SetStateAction<Prompted>>,
  setDeactivateInputBox: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function CommentCompo({ comment, setPrompt, setDeactivateInputBox }: CommentType) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [openReply, setOpenReply] = useState<OpenReply>({type: 'nil', assert: false})
  const { setLoginPrompt } = useThemeContext() as ThemeContextType
  const [writeReply, setWriteReply] = useState<string>('');
  const [reveal, setReveal] = useState<boolean>(false)
  const [expand, setExpand] = useState<boolean>(false)
  const responseRef = useRef<HTMLTextAreaElement>();
  const [deleteComment, { isLoading, isError, isSuccess: isSuccessDeleted, 
    error, isUninitialized }] = useDeleteCommentMutation()

  useEffect(() => {
    openReply.assert ? setDeactivateInputBox(true) : setDeactivateInputBox(false)
  }, [openReply.assert, setDeactivateInputBox])

  const deleteSingleComment = async() => {
    try{
      await deleteComment({userId: currentUserId, commentId: comment?._id}).unwrap()
      //await storyApiSlice.useGetStoriesByCategoryQuery(getNavigation).refetch()
    }
    catch(err: unknown){
      const errors = (error as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
      isError && toast.error(`${errors?.status === 'FETCH_ERROR' ?
      'SERVER ERROR' : (errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message)}`, ErrorStyle)
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
  }, [isSuccessDeleted, isUninitialized, setPrompt])

  return (
    <article 
      className={`relative text-sm flex flex-col gap-1 p-1.5 transition-all ${isLoading ? 'animate-pulse' : ''}`}>
      <BodyComponent 
        responseRef={
          responseRef as React.MutableRefObject<HTMLTextAreaElement>
        }
        setWriteReply={setWriteReply} currentUserId={currentUserId} 
        setReveal={setReveal} writeReply={writeReply} setOpenReply={setOpenReply} 
        deleteSingleComment={deleteSingleComment} comment={comment} reveal={reveal} 
        expand={expand} openReply={openReply} setPrompt={setPrompt} setExpand={setExpand} 
      />
    </article>
  )
}