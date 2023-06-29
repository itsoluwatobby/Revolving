import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";
import { BiCodeAlt } from 'react-icons/bi'
import { TextRules, sensitiveWords } from "../fonts";
import RevolvingEditor from 'react-monaco-editor';
import { useDispatch } from "react-redux";
import { setPresentLanguage } from "../features/story/codeSlice";

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
  const [value, setValue] = useState<string>('');
  const dispatch = useDispatch()
  
  const handleChange = (newValue: string) => setValue(newValue)

  const editorDidMount = (editor: any, monaco: any) => {
    editor.focus()
  }

  useEffect(() => {
    localStorage.setItem(`revolving-${filename.name}`, value)
  }, [value, filename.name])

  const options = {
    selectOnLineNumbers: true
  };

  useEffect(() => {
    const codeName = `revolving-${filename.name}`
    const isPresent = Boolean(localStorage.getItem(codeName))
    if(codeName.split('-')[1] === filename.name && isPresent){
      setValue(localStorage.getItem(codeName) as string)
    }
    else{
      setValue(files[filename.name as keyof FileType].defaultValue)
    }
    localStorage.setItem('revolving-languageName', filename.name as string)
    dispatch(setPresentLanguage(filename.name as string))
  }, [filename.name, dispatch])

  return (
    <section className="code_page w-full sm:w-3/5 sm:m-auto sm:mt-0 sm:mb-0 flex flex-col gap-2">

      <div className="flex items-center shadow-lg justify-evenly border p-0.5 gap-0.5 mb-0 rounded-lg">
        {
          language.map(name => (
            <p 
              onClick={() => setFilename({name: name})}
              className={`cursor-pointer text-center w-full border border-t-0 border-b-0 px-6 border-l-0 last:border-r-0 capitalize rounded-lg shadow-2xl font-mono shadow-slate-900 ${theme == 'light' ? 'bg-slate-300' : '' } ${name == filename.name ? 'bg-slate-500' : ''}`}
              key={name}>{name}
            </p>
          ))
        }
      </div>
       <RevolvingEditor 
        height='80%'
        width='100%'
        theme='vs-dark'
        language={filename.name}
        value={value}
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