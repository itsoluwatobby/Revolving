import { useEffect, useRef, useState } from 'react';
import { useThemeContext } from '../../hooks/useThemeContext';
import { PromptLiterals, ThemeContextType } from '../../posts';
import { CommentProps, CommentResponseProps, ErrorResponse, OpenReply, Prompted } from '../../data';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { useGetCommentQuery } from '../../app/api/commentApiSlice';
import { SkeletonComment } from '../skeletons/SkeletonComment';
import { useGetResponsesQuery } from '../../app/api/responseApiSlice';
import SingleComment from './SingleComment';
import CommentBase from './CommentBase';
import { ResponseBody } from './response/ResponseBody';
import { checkCount } from '../../utils/navigator';

export default function EnlargeComment() {
  const { theme, parseId, enlarge, setEnlarge } = useThemeContext() as ThemeContextType
  const [targetComment, setTargetComment] = useState<CommentProps | null>(null);
  const userId = localStorage.getItem('revolving_userId') as string
  const [openReply, setOpenReply] = useState<OpenReply>({type: 'nil', assert: false})
  const [writeReply, setWriteReply] = useState<string>('');
  const {data, isLoading, isError, error} = useGetCommentQuery(parseId)
  const {data: responseData, isLoading: isLoadingResponses} = useGetResponsesQuery(parseId)
  const [responses, setResponses] = useState<CommentResponseProps[]>([]);
  const [prompt, setPrompt] = useState<Prompted>({type: 'nil', assert: false});
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
      {!isLoading && targetComment ? 
        <>
          <SingleComment 
            targetComment={targetComment as CommentProps}
            closeInput={closeInput}
            theme={theme}
          />
          <div className="relative flex items-center gap-4">
            <CommentBase enlarged
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
                  <span className='flex flex-col gap-2'>
                    <small>No response yet</small>
                    <small>Say something to start the converstion</small>
                  </span> 
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
                        response={response} 
                        prompt={prompt}
                        setPrompt={setPrompt} 
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
    <section className='hidebars relative overflow-y-scroll p-2'>
      <>
        <RiArrowGoBackLine
          onClick={() => setEnlarge({type: 'enlarge', assert: false})}
          className={`mb-3 bg-slate-500 p-0.5 rounded-full text-xl text-white fixed cursor-pointer hover:text-gray-400`}
        />
        {
          isLoading ? <SkeletonComment />
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
          // enlarge?.type == 'enlarge' ?
          //   targetComment && singleCommentContent
          //   :
            enlarge?.type == 'open' ? commentWithResponse : null
          )
        }
      </>
      <p className={`absolute right-2 top-1 rounded-lg text-xs font-mono pr-2.5 pl-2.5 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-600'}`}>
        Responses <span>{checkCount(targetComment?.commentResponse as string[])}</span>
      </p>
    </section>
  )
}