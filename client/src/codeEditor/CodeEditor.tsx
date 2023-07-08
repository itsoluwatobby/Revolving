import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useThemeContext } from "../hooks/useThemeContext";
import { PostContextType, ThemeContextType } from "../posts";
import { BiCodeAlt } from 'react-icons/bi'
import { TextRules, sensitiveWords } from "../fonts";
import RevolvingEditor from 'react-monaco-editor';
import { useDispatch } from "react-redux";
import { setPresentLanguage } from "../features/story/codeSlice";
import { usePostContext } from "../hooks/usePostContext";

type CodeType = {
  name: string,
  language: string,
  defaultValue: string
}
const language: string[] = ["python", "javascript", "typescript", 'html']

type FileType = Record<string, CodeType>

const files: FileType = {
  "python":{
    name: "script.py",
    language: 'python',
    defaultValue: "print('Welcome to python')"
  },
  "javascript":{
    name: "javascript.js",
    language: 'javascript',
    defaultValue: "console.log('Welcome to javascript')"
  },
  "typescript":{
    name: "typescript.ts",
    language: 'typescript',
    defaultValue: "const name: string = 'Typescript'\nconsole.log('Welcome to ', name)"
  },
  "html":{
    name: "index.html",
    language: 'html', 
    defaultValue: "<div>Hello here</div>"
  }
}

export default function CodeBlock() {
  const { theme } = useThemeContext() as ThemeContextType;
  const [filename, setFilename] = useState<{name?:string,value?:string}>({
    name: localStorage.getItem('revolving-languageName') || 'python', value: 'print(\'Welcome to python\')'
  });
  const { inputValue, codeStore, setInputValue } = usePostContext() as PostContextType
  const dispatch = useDispatch()
  
  const handleChange = (newValue: string) => setInputValue(prev => ({...prev, code: newValue}))
console.log(codeStore)
  const editorDidMount = (editor: any, monaco: any) => {
    editor.focus()
  }

  useEffect(() => {
    let isMounted = true
    const getValue = files[filename.name as string].defaultValue
    if(getValue && isMounted){
      localStorage.setItem(`revolving-${filename.name}`, getValue)
      console.log(getValue)
      setInputValue(prev => ({...prev, code: getValue}))
    }
    else return

    return () => {
      isMounted = false
    }
  }, [filename.name, setInputValue])

  const options = {
    selectOnLineNumbers: true
  };

  // Get code value with the correct lang type
  useEffect(() => {
    const codeName = `revolving-${filename.name}`
    const isPresent = Boolean(localStorage.getItem(codeName))
    if(codeName.split('-')[1] === filename.name && isPresent){
      setInputValue(prev => ({...prev, code: localStorage.getItem(codeName) as string}))
    }
    else{
      setInputValue(prev => ({...prev, langType: files[filename.name as keyof FileType].defaultValue}))
    }
    localStorage.setItem('revolving-languageName', filename.name as string)
    setInputValue(prev => ({...prev, langType: filename.name as string}))
    dispatch(setPresentLanguage(filename.name as string))
  }, [filename.name, dispatch, setInputValue])

  return (
    <section className="code_page w-full sm:w-3/5 sm:m-auto sm:mt-0 sm:mb-0 flex flex-col gap-2">

      <div className="flex items-center text-sm w-full shadow-lg justify-evenly border p-0.5 gap-0.5 mb-0 rounded-lg">
        {
          language.map(name => (
            <p 
              onClick={() => setFilename({name: name})}
              className={`cursor-pointer text-center w-full mobile:text-xs mobile:font-bold border border-t-0 border-b-0 px-6 border-l-0 last:border-r-0 capitalize rounded-lg shadow-2xl font-mono shadow-slate-900 ${theme == 'light' ? 'bg-slate-300' : '' } ${name == filename.name ? 'bg-slate-500' : ''}`}
              key={name}>{name}
            </p>
          ))
        }
      </div>
       <RevolvingEditor 
        height='88%'
        width='100%'
        theme='vs-dark'
        language={filename.name}
        value={inputValue.code}
        options={options}
        onChange={handleChange}
        editorDidMount={editorDidMount}
       />
    </section>
  )
}

{/*
  <textarea 
          className='editor' 
          role='Code Editor' 
          onChange={handleChange}
          spellCheck={true}
          aria-label='Code Editor'
        />
        <div 
          className='editorsss' 
          role='Code Editor'
        >
          {element}
        </div>
*/}