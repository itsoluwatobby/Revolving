import CodeBody from './CodeBody';
import { CiEdit } from 'react-icons/ci';
import { useCallback, useState } from 'react';
import { ButtonType, CodeProps } from '../../data';
import { BsCheckSquare, BsTrash } from 'react-icons/bs';
import { useThemeContext } from '../../hooks/useThemeContext';
import { CodeStoreType, Theme, ThemeContextType } from '../../posts';

type CodeCardProps = {
  count: number,
  code: CodeStoreType,
  submitToSend: CodeProps[],
  codeStore: CodeStoreType[],
  setSubmitToSend: React.Dispatch<React.SetStateAction<CodeProps[]>>,
  setInputValue: React.Dispatch<React.SetStateAction<CodeStoreType>>,
  setCodeStore: React.Dispatch<React.SetStateAction<CodeStoreType[]>>
}

export default function CodeCard({ code, count, codeStore, setCodeStore, submitToSend, setSubmitToSend, setInputValue }: CodeCardProps) {
  const { editing, isPresent, codeEditor, theme, success, setEditing } = useThemeContext() as ThemeContextType
  const [includesId, setIncludesId] = useState<string[]>([])
  const nodeRef = useCallback((node: HTMLElement) => {
    node ? node.scrollIntoView({behavior: 'smooth'}) : null
  }, []);
  const buttonClass = useCallback((theme: Theme, type: ButtonType) => {
    return `
    rounded-md ${type === 'EDIT' ? 'text-lg' : 'text-[18px]'} cursor-pointer transition-all shadow-lg p-0.5 hover:opacity-70 transition-shadow transition-all active:opacity-100 border ${theme == 'light' ? 'bg-slate-800' : 'bg-slate-900'}
    `
  }, [])

  const editCode = (codeId: string) => {
    const getStore = (JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[]) ?? []
    const target = getStore.find(code => code?.codeId == codeId) as CodeStoreType
    setInputValue(target)
    if(editing.codeId !== target.codeId){
      setEditing({editing: true, codeId: target.codeId as string, code: target.code, type: 'EDIT'})
    }
    else{
      setEditing({editing: false, codeId: '', code: '', type: 'NIL'})
    }
  }

  const acceptToSubmit = (codeId: string) => {
    const getStore = (JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[]) ?? []
    const target = getStore.find(code => code?.codeId == codeId) as CodeStoreType
    const targetCode = { codeId: target?.codeId, language: target?.langType, body: target?.code } as CodeProps
    const findConflict = includesId?.find(id => id === targetCode?.codeId)
    if(!findConflict) {
      setSubmitToSend(prev => ([...prev, targetCode]))
      setIncludesId(prev => ([...prev, targetCode?.codeId as string]))
    }
    else{
      const others = submitToSend?.filter(pre => pre?.codeId !== targetCode?.codeId)
      const otherIds = includesId?.filter(id => id !== targetCode?.codeId)
      setSubmitToSend([...others])
      setIncludesId([...otherIds as string[]])
    }
  }

  const deleteCode = (codeId: string) => {
    const getStore = JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] ?? []
    const others = getStore.filter(code => code?.codeId !== codeId)
    setEditing({editing: false, codeId, code: '', type: 'DELETE'})
    setCodeStore([...others])
    localStorage.setItem('revolving-codeStore', JSON.stringify(others))
  }

  return (
    <article 
      ref={nodeRef as React.LegacyRef<HTMLElement>}
      key={code.codeId}
      className={`relative ${theme == 'light' ? '' : ''} ${editing?.codeId == code.codeId ? 'bg-slate-700' : 'bg-slate-950'} ${includesId?.includes(code.codeId as string) ? (theme === 'light' ? 'opacity-80' : 'opacity-30') : ''} ${codeStore.length ? 'scale-100' : 'scale-0'} transition-all shadow-inner text-white flex flex-col p-1.5 h-full max-w-[160px] min-w-[160px] shadow-slate-400 rounded-md`}>
        <div className="flex items-center justify-between">
          <p className="capitalize bg-slate-800 pl-1 pr-1 rounded-md">{code.langType}</p>
          <div className="flex items-center gap-1">
            {
              codeEditor ? 
                <CiEdit
                  onClick={() => editCode(code.codeId as string)}
                  className={buttonClass(theme, 'EDIT')} /> 
              :
                <BsCheckSquare 
                  title='check'
                  onClick={() => acceptToSubmit(code.codeId as string)}
                  className={`${buttonClass(theme, 'CHECK')} ${includesId?.includes(code.codeId as string) ? 'text-green-500' : ''}`}
                />
            }
            <BsTrash 
              onClick={() => deleteCode(code.codeId as string)}
              className={buttonClass(theme, 'DELETE')} />
          </div>
        </div>
      <div className="bg-slate-700 top-4 h-0.5"/>
      <code className="hideCodeBars text-xs overflow-x-scroll overflow-y-scroll p-1 cursor-all-scroll h-full w-full">
        <CodeBody codeBody={code?.code} />
      </code>
      {((isPresent.codeId == code.codeId) || (editing.type == 'DELETE' && editing.codeId == code.codeId)) ? (
        <p className="absolute p-1 pl-2 pr-2 translate-x-[40%] top-[40%] shadow-lg shadow-slate-400 bg-slate-900 rounded-lg">
          {isPresent.present ? 'Already saved' : 'Deleting...'}
        </p>
        ) : null
      }
      {(success.res && success.codeId == code.codeId) ? (
        <p className="absolute p-1 pl-2 pr-2 translate-x-[40%] top-[40%] shadow-lg shadow-slate-400 bg-slate-900 rounded-lg">
          Updated
        </p>
        ) : null
      }
      <span className="absolute bottom-0 rounded-full left-0 bg-green-950 w-4 grid place-content-center h-4 text-xs p-1">{++count}</span>
    </article>
  )
}