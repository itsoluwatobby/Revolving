import { useEffect, useRef, useState } from 'react'
import { useThemeContext } from '../../hooks/useThemeContext'
import { PromptLiterals, ThemeContextType } from '../../posts'
import { comments } from '../../commentData'
import { CommentProps, ErrorResponse } from '../../data'
import { reduceLength } from '../../utils/navigator'
import CommentBase from './CommentBase'
import { format } from 'timeago.js'
import { RiArrowGoBackLine } from 'react-icons/ri'
import { useGetCommentQuery } from '../../app/api/commentApiSlice'
import { SkeletonComment } from '../skeletons/SkeletonComment'

export default function EnlargeComment() {
  const { theme, parseId, setEnlarge } = useThemeContext() as ThemeContextType
  const [targetComment, setTargetComment] = useState<CommentProps | null>(null);
  const userId = localStorage.getItem('revolving_userId') as string
  const [openReply, setOpenReply] = useState<boolean>(false)
  const [writeReply, setWriteReply] = useState<string>('');
  const {data, isLoading, isError, error} = useGetCommentQuery(parseId)
  const [keepPrompt, setKeepPrompt] = useState<PromptLiterals>('Dommant');
  const responseRef = useRef<HTMLTextAreaElement>();
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>();

  useEffect(() => {
    let isMounted = true
    isMounted && setTargetComment(data as CommentProps)

    return () => {
      isMounted = false
    }
  }, [parseId, data])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  const closeInput = () => {
    !writeReply.length ? setOpenReply(false) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }

  let singleCommentContent;

  isLoading ? singleCommentContent = (
      <SkeletonComment />
  )
  : isError ? singleCommentContent = (
    <p className='text-center mt-10 text-lg'>{errorMsg?.status == 404 ? 'No Comment Avaialable' : 'Network Error, Please check your connection'}</p>
  ) : singleCommentContent = (
    <article className="text-sm flex flex-col gap-1">
      {!isLoading && comments?.length ? 
        <>
          <div className={`sticky top-0 flex items-center ml-16 gap-4 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit p-0.5 rounded-full pl-2 pr-2`}>
            <p className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}> 
              {reduceLength(targetComment?.author as string, 15)}
            </p>
            <span className="font-bold text-black">.</span>
            <p className="text-xs text-gray-700">{format(targetComment?.commentDate as string)}</p>
          </div>
          <p 
            onClick={closeInput}
            className="cursor-grab text-justify tracking-wide first-letter:ml-3 first-letter:text-lg first-letter:font-medium">
            {targetComment?.comment}
          </p>
          <div className="flex items-center gap-4">
            <CommentBase 
              responseRef={
                responseRef as React.MutableRefObject<HTMLTextAreaElement>
              }
              userId={userId} theme={theme} 
              comment={targetComment as CommentProps} 
              writeReply={writeReply} 
              setWriteReply={setWriteReply} 
              openReply={openReply} 
              setOpenReply={setOpenReply} 
              keepPrompt={keepPrompt} 
              setKeepPrompt={setKeepPrompt} 
            />
          </div>
        </>
          : null
      }
    </article>  
    )

  return (
    <section className='hidebars overflow-y-scroll p-2'>
      <>
        <RiArrowGoBackLine
          onClick={() => setEnlarge(false)}
          className={`mb-3 text-xl text-white fixed cursor-pointer hover:text-gray-400`}
        />
        {targetComment && singleCommentContent}
      </>
    </section>
  )
}