import CommentBase from './CommentBase';
import { checkCount, reduceLength } from '../../utils/navigator';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { useEffect, useRef, useState } from 'react';
import { ResponseBody } from './response/ResponseBody';
import { useThemeContext } from '../../hooks/useThemeContext';
import { PromptLiterals, ThemeContextType } from '../../posts';
import { SkeletonComment } from '../skeletons/SkeletonComment';
import { useGetCommentQuery } from '../../app/api/commentApiSlice';
import { useGetResponsesQuery } from '../../app/api/responseApiSlice';
import { CommentProps, CommentResponseProps, ErrorResponse, OpenReply, Prompted } from '../../data';
import { TDate, format } from 'timeago.js';

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
          <p 
            onClick={closeInput}
            className="cursor-grab text-justify tracking-wide first-letter:ml-3 first-letter:text-lg first-letter:font-medium"
          >
            {targetComment?.comment}
          </p>

          <div className="relative flex items-center gap-4">
            <CommentBase enlarged
              responseRef={
                responseRef as React.MutableRefObject<HTMLTextAreaElement>
              }
              userId={userId} theme={theme} comment={targetComment as CommentProps} 
              writeReply={writeReply} setWriteReply={setWriteReply} openReply={openReply} 
              setOpenReply={setOpenReply} keepPrompt={keepPrompt} setKeepPrompt={setKeepPrompt}
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
                    responses?.map(response => (
                      <ResponseBody 
                        // prompt={prompt}  
                        key={response._id} 
                        userId={userId} response={response} setPrompt={setPrompt} 
                        targetComment={targetComment as CommentProps} isLoadingResponses={isLoadingResponses}
                      />
                    ))
                  ) : null
              )
        }
      </div>
    </>
  )

  return (
    <section className='hidebars relative overflow-y-scroll p-2 pt-0'>
      <nav className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-600'} rounded-md sticky top-0 z-10 flex items-center justify-between p-1`}>
        <RiArrowGoBackLine
          onClick={() => setEnlarge({type: 'enlarge', assert: false})}
          className={`flex-none bg-slate-500 p-0.5 rounded-full text-xl text-white cursor-pointer hover:text-gray-400`}
        />

        {
          !isLoadingResponses ?
          <div className={`whitespace-nowrap sticky top-0 flex mobile:gap-2 items-center gap-2 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit rounded-full pl-2 pr-2`}>
            <p className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}> 
              {reduceLength(targetComment?.author as string, 15)}
            </p>
            <span className="font-bold text-black">.</span>
            <p className="text-xs text-gray-700">{format(targetComment?.createdAt as TDate)}</p>
          </div>
        : null  
        }

        <p className={`flex-none rounded-lg text-xs font-mono pr-2.5 pl-2.5 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-600'}`}>
          Responses <span>{checkCount(targetComment?.commentResponse as string[])}</span>
        </p>
      </nav>
        { enlarge?.type == 'open' ? commentWithResponse : null }
    </section>
  )
}

//absolute right-2 top-1 