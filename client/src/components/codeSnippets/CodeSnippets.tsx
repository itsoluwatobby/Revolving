import CodeCard from "./CodeCard";
import { useEffect } from 'react';
import ImageCard from "./ImageCard";
import { OpenSnippet } from "../../data"
import { usePostContext } from "../../hooks/usePostContext"
import { ConflictType, PostContextType, Theme, UpdateSuccess } from "../../posts";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";

type CodeSnippetProps = {
  theme: Theme,
  codeEditor: boolean,
  snippet: OpenSnippet,
  success: UpdateSuccess,
  isPresent: ConflictType,
  setIsPresent: React.Dispatch<React.SetStateAction<ConflictType>>
  setSnippet: React.Dispatch<React.SetStateAction<OpenSnippet>>
  setSuccess: React.Dispatch<React.SetStateAction<UpdateSuccess>>
}

let prevCodeLength = 0
let prevImageLength = 0
export const CodeSnippets = ({ theme, isPresent, success, setSnippet, setSuccess, snippet, setIsPresent, codeEditor }: CodeSnippetProps) => {
  const { codeStore, imagesFiles, submitToSend, setImagesFiles, setCodeStore, setInputValue, setSubmitToSend } = usePostContext() as PostContextType;

  const sortedStoreCode = codeStore.slice().sort((a, b) => b.date.localeCompare(a.date))

  useEffect(() => {
    if(codeStore.length !== prevCodeLength) {
      setSnippet('Snippet')
      prevCodeLength = codeStore.length
    } 
    else if(imagesFiles.length !== prevImageLength){
        setSnippet('Image')
        prevImageLength = imagesFiles.length
    }
    else{
      codeStore.length == 0 && imagesFiles.length >= 1 
        ? setSnippet('Image') 
          : codeStore.length >= 1 && imagesFiles.length == 0 
            ? setSnippet('Snippet') : setSnippet('Nil')   
    }
  }, [codeStore, imagesFiles, setSnippet])

  useEffect(() => {
    if(isPresent.present && snippet == 'Image') {
      setSnippet('Snippet')
      setIsPresent({codeId: '', present: false})
    }
  }, [snippet, setSnippet, setIsPresent, isPresent.present])

  useEffect(() => {
    let timerId: TimeoutId;
    if(isPresent.present || success.res){
      timerId = setTimeout(() => {
        setIsPresent({codeId: '', present: false})
        setSuccess({codeId: '', res: false})
      }, 5000);
    }
    return () => clearTimeout(timerId)
  }, [isPresent.present, setIsPresent, success.res, setSuccess])
  
  return (
    <section className={`stackflow ${theme == 'light' ? 'bg-slate-100' : 'bg-slate-900'} ${(codeStore?.length >= 1 || imagesFiles.length >= 1) ? 'scale-100' : 'scale-0'} transition-all self-center ${codeEditor ? '' : 'mt-4'} max-w-[90%] w-fit p-1.5 h-48 shadow-md shadow-slate-500 rounded-md overflow-x-scroll flex items-center gap-2`}>
      {
        snippet !== 'Image' ? (
          sortedStoreCode?.map((code, index) => (
            <CodeCard key={code.codeId}
              code={code} setSubmitToSend={setSubmitToSend} codeStore={codeStore} count={index}
              setCodeStore={setCodeStore} setInputValue={setInputValue} submitToSend={submitToSend}
            />
          ))
        ) : ( 
          imagesFiles?.map((image, index) => (
            <ImageCard key={image.imageId} 
              image={image} theme={theme} count={index}
              imagesFiles={imagesFiles} setImagesFiles={setImagesFiles}
            />
          ))
        )
      }
    </section>
  )
}