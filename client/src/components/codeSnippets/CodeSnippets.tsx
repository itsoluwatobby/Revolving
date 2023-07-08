import { CiEdit } from "react-icons/ci";
import { ButtonType } from "../../data"
import { usePostContext } from "../../hooks/usePostContext"
import { PostContextType, Theme } from "../../posts"
import CodeBody from "./CodeBody";
import { useCallback } from 'react';
import { BsTrash } from "react-icons/bs";

type CodeSnippetProps = {
  theme: Theme,
  codeEditor: boolean
}

export const CodeSnippets = ({ theme, codeEditor }: CodeSnippetProps) => {
  const { codeStore } = usePostContext() as PostContextType;
  const buttonClass = useCallback((theme: Theme, type: ButtonType) => {
    return `
    rounded-md ${type === 'EDIT' ? 'text-lg' : 'text-[18px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow duration-150 active:opacity-100 border ${theme == 'light' ? 'bg-slate-800' : 'bg-slate-900'}
    `
  }, [])

  return (
    <section className={`stackflow ${theme == 'light' ? 'bg-slate-700' : 'bg-slate-900'} ${codeStore?.length >= 1 ? 'scale-100' : 'scale-0'} transition-all self-center ${codeEditor ? '' : 'mt-4'} max-w-[90%] w-fit p-1.5 h-48 shadow-2xl shadow-slate-500 rounded-md overflow-x-scroll flex items-center gap-2`}>
      {
        codeStore.map(code => (
          <article 
            key={code.codeId}
            className={`${theme == 'light' ? '' : ''} shadow-inner text-white flex flex-col p-1.5 h-full min-w-[160px] shadow-slate-400 rounded-md bg-slate-950`}>
              <div className="flex items-center justify-between">
                <p className="capitalize">{code.langType}</p>
                <div className="flex items-center gap-0.5">
                  <CiEdit className={buttonClass(theme, 'EDIT')} />
                  <BsTrash className={buttonClass(theme, 'DELETE')} />
                </div>
              </div>
            <div className="bg-slate-700 top-4 h-0.5"/>
            <code className="text-xs">
              <CodeBody codeBody={code?.code} />
            </code>
          </article>
        ))
      }
    </section>
  )
}