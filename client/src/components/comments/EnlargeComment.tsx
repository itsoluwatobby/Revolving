import { useEffect, useRef, useState } from 'react';
import { useThemeContext } from '../../hooks/useThemeContext';
import { PromptLiterals, ThemeContextType } from '../../posts';
import { comments } from '../../commentData';
import { CommentProps, CommentResponseProps, ErrorResponse, OpenReply } from '../../data';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { useGetCommentQuery } from '../../app/api/commentApiSlice';
import { SkeletonComment } from '../skeletons/SkeletonComment';
import { useGetResponsesQuery } from '../../app/api/responseApiSlice';
import SingleComment from './SingleComment';
import CommentBase from './CommentBase';
import { ResponseBody } from './response/ResponseBody';

export default function EnlargeComment() {
  const { theme, parseId, enlarge, setEnlarge } = useThemeContext() as ThemeContextType
  const [targetComment, setTargetComment] = useState<CommentProps | null>(null);
  const userId = localStorage.getItem('revolving_userId') as string
  const [openReply, setOpenReply] = useState<OpenReply>({type: 'nil', assert: false})
  const [writeReply, setWriteReply] = useState<string>('');
  const {data, isLoading, isError, error} = useGetCommentQuery(parseId)
  const {data: responseData, isLoading: isLoadingResponses, isError: isErrorResponses, error: errorResponses} = useGetResponsesQuery(parseId)
  const [responses, setResponses] = useState<CommentResponseProps[]>([]);
  const [keepPrompt, setKeepPrompt] = useState<PromptLiterals>('Dommant');
  const responseRef = useRef<HTMLTextAreaElement>();
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>();

  useEffect(() => {
    let isMounted = true
    isMounted && setTargetComment(data as CommentProps)

    return () => {
      isMounted = false
    }
  }, [data])
  
  useEffect(() => {
    let isMounted = true
    isMounted && setResponses(responseData as CommentResponseProps[])

    return () => {
      isMounted = false
    }
  }, [responseData])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  const closeInput = () => {
    !writeReply.length ? setOpenReply({type: 'nil', assert: false}) : setKeepPrompt('Show');
    if(responseRef.current) responseRef?.current.focus()
  }
 
  const singleCommentContent = (
    <article className="text-sm flex flex-col gap-1">
      {!isLoading && comments?.length ? 
        <>
          <SingleComment 
            targetComment={targetComment as CommentProps}
            closeInput={closeInput}
            theme={theme}
          />
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

  const commentWithResponse = (
    <>
      {singleCommentContent}
      <div className={`w-full h-[2px] bg-slate-600 mt-2`} />
      <div className={`flex flex-col bg-slate-800`}>
        {
          isLoadingResponses ? <SkeletonComment />
            : isError ? (
              <p className='text-center mt-10 text-sm'>
              {
                errorMsg?.status == 404 ? 
                  <p className='flex flex-col gap-2'>
                    <span>No responses yets</span>
                    <span>Say something to start the converstion</span>
                  </p> 
                  : 
                  <span>Network Error, Please check your connection</span>
                }
              </p>
              ) : (
                  !isLoadingResponses && responses?.length ? (
                    responses.map(response => (
                      <ResponseBody 
                        key={response._id}
                        userId={userId}
                        theme={theme}
                        response={response}
                        targetComment={targetComment as CommentProps}
                        isLoadingResponses={isLoadingResponses}
                      />
                    ))
                  ) : null
              )
        }
      </div>
    </>
  )

  return (
    <section className='hidebars overflow-y-scroll p-2'>
      <>
        <RiArrowGoBackLine
          onClick={() => setEnlarge({type: 'enlarge', assert: false})}
          className={`mb-3 bg-slate-500 p-0.5 rounded-full text-xl text-white fixed cursor-pointer hover:text-gray-400`}
        />
        {
          isLoading ? <SkeletonComment />
        : isError ? (
          <p className='text-center mt-10 text-lg'>{errorMsg?.status == 404 ? 'No Comment Avaialable' : 'Network Error, Please check your connection'}</p>
        ) : (
          enlarge?.type == 'enlarge' ?
            targetComment && singleCommentContent
            :
            enlarge?.type == 'open' ? commentWithResponse : null
          )
        }
      </>
    </section>
  )
}