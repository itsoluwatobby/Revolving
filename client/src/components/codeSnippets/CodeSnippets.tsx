import { CiEdit } from "react-icons/ci";
import { ButtonType } from "../../data"
import { usePostContext } from "../../hooks/usePostContext"
import { CodeStoreType, ConflictType, PostContextType, Theme } from "../../posts"
import CodeBody from "./CodeBody";
import { useCallback, useEffect, useState } from 'react';
import { BsTrash } from "react-icons/bs";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";

type CodeSnippetProps = {
  theme: Theme,
  codeEditor: boolean,
  isPresent: ConflictType,
  setIsPresent: React.Dispatch<React.SetStateAction<ConflictType>>
}

type EditingProp = {
  editing: boolean,
  codeId: string,
  type?: 'DELETE' | 'EDIT' | 'NIL'
}

export const CodeSnippets = ({ theme, isPresent, setIsPresent, codeEditor }: CodeSnippetProps) => {
  const { codeStore, setCodeStore, setInputValue } = usePostContext() as PostContextType;
  const [editing, setEditing] = useState<EditingProp>({editing: false, codeId: ''});
  const nodeRef = useCallback((node: HTMLElement) => {
    node ? node.scrollIntoView({behavior: 'smooth'}) : null
    // isPresent.present ? node.scrollIntoView({behavior: 'smooth'}) : node.nodeName
  }, []);
  const buttonClass = useCallback((theme: Theme, type: ButtonType) => {
    return `
    rounded-md ${type === 'EDIT' ? 'text-lg' : 'text-[18px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-800' : 'bg-slate-900'}
    `
  }, [])
console.log(editing)
  
  useEffect(() => {
    let timerId: TimeoutId;
    if(isPresent.present){
      timerId = setTimeout(() => {
        setIsPresent({codeId: '', present: false})
      }, 5000);
    }

    return () => clearTimeout(timerId)
  }, [isPresent.present, setIsPresent])

  const editCode = (codeId: string) => {
    const getStore = JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] ?? []
    const target = getStore.find(code => code?.codeId == codeId) as CodeStoreType
    setInputValue(target)
    if(editing.codeId !== target.codeId){
      setEditing({editing: true, codeId: target.codeId as string, type: 'EDIT'})
    }
    else{
      setEditing({editing: false, codeId: '', type: 'NIL'})
    }
  }

  const deleteCode = (codeId: string) => {
    const getStore = JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] ?? []
    const others = getStore.filter(code => code?.codeId !== codeId)
    setEditing({editing: false, codeId, type: 'DELETE'})
    setCodeStore([...others])
    localStorage.setItem('revolving-codeStore', JSON.stringify(others))
  }

  return (
    <section className={`stackflow ${theme == 'light' ? 'bg-slate-700' : 'bg-slate-900'} ${codeStore?.length >= 1 ? 'scale-100' : 'scale-0'} transition-all self-center ${codeEditor ? '' : 'mt-4'} max-w-[90%] w-fit p-1.5 h-48 shadow-2xl shadow-slate-500 rounded-md overflow-x-scroll flex items-center gap-2`}>
      {
        codeStore.map(code => (
          <article 
            ref={nodeRef as React.LegacyRef<HTMLElement>}
            key={code.codeId}
            className={`relative ${theme == 'light' ? '' : ''} ${editing?.codeId == code.codeId ? 'bg-slate-700' : 'bg-slate-950'} shadow-inner text-white flex flex-col p-1.5 h-full max-w-[160px] min-w-[160px] shadow-slate-400 rounded-md`}>
              <div className="flex items-center justify-between">
                <p className="capitalize bg-slate-800 pl-1 pr-1 rounded-md">{code.langType}</p>
                <div className="flex items-center gap-0.5">
                  {
                    codeEditor ? 
                      <CiEdit
                        onClick={() => editCode(code.codeId as string)}
                        className={buttonClass(theme, 'EDIT')} /> : null
                  }
                  <BsTrash 
                    onClick={() => deleteCode(code.codeId as string)}
                    className={buttonClass(theme, 'DELETE')} />
                </div>
              </div>
            <div className="bg-slate-700 top-4 h-0.5"/>
            <code className="text-xs">
              <CodeBody codeBody={code?.code} />
            </code>
            {((isPresent.codeId == code.codeId) || (editing.type == 'DELETE' && editing.codeId == code.codeId)) ? (
              <p className="absolute p-1 pl-2 pr-2 translate-x-[40%] top-[40%] shadow-lg shadow-slate-400 bg-slate-900 rounded-lg">
                {isPresent.present ? 'Already saved' : 'Deleting...'}
              </p>
              ) : null
            }
          </article>
        ))
      }
    </section>
  )
}